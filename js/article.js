function extractMath(markdown) {
    const saved = [];
    let text = markdown.replace(/\$\$([\s\S]+?)\$\$/g, match => {
        const token = `@@MATH_${saved.length}@@`;
        saved.push([token, match]);
        return token;
    });
    text = text.replace(/(^|[^$])\$(?!\$)([^$\n]+?)\$(?!\$)/g, (_, prefix, content) => {
        const token = `@@MATH_${saved.length}@@`;
        saved.push([token, `$${content}$`]);
        return prefix + token;
    });
    return { text, saved };
}

function resolveMarkdownUrl(href, markdownUrl) {
    if (!href || /^(?:#|data:|mailto:|https?:|\/\/)/i.test(href)) return href;
    if (href.startsWith('blog/')) return new URL('/' + href, markdownUrl).href;
    return new URL(href, markdownUrl).href;
}

function renderMarkdown(markdown, source) {
    const { text, saved } = extractMath(markdown);
    const markdownUrl = new URL(source, location.href);
    let html = window.marked.parse(text, {
        walkTokens(token) {
            if (token.type === 'image' || token.type === 'link') {
                token.href = resolveMarkdownUrl(token.href, markdownUrl);
            }
        }
    });
    for (const [token, value] of saved) html = html.replaceAll(token, value);

    const draft = document.createElement('div');
    draft.innerHTML = html;
    // Marked's token walker does not rewrite URLs inside raw HTML in a Markdown file.
    for (const element of draft.querySelectorAll('[src], [href]')) {
        for (const attribute of ['src', 'href']) {
            const value = element.getAttribute(attribute);
            if (value) element.setAttribute(attribute, resolveMarkdownUrl(value, markdownUrl));
        }
    }
    if (draft.firstElementChild?.tagName === 'H1') draft.firstElementChild.remove();
    for (const blockquote of draft.querySelectorAll('blockquote')) {
        const first = blockquote.firstElementChild;
        if (first?.tagName !== 'P') continue;
        const marker = first.textContent.trim().match(/^\[!([a-z]+)\]\s*([^\n]*)/i);
        if (!marker) continue;
        const aside = document.createElement('aside');
        aside.className = `md-alert md-alert-${marker[1].toLowerCase()}`;
        const heading = document.createElement('strong');
        heading.textContent = marker[2] || marker[1];
        aside.append(heading);
        first.remove();
        aside.append(...blockquote.childNodes);
        blockquote.replaceWith(aside);
    }
    for (const image of draft.querySelectorAll('img')) {
        image.loading = 'lazy';
        image.decoding = 'async';
    }
    return draft;
}

function localized(value, lang) {
    return typeof value === 'object' && value !== null ? (value[lang] || value.en || value.zh || '') : (value || '');
}

function displayDate(value, lang) {
    const [year, month, day] = value.split('-').map(Number);
    if (lang === 'zh') return `${year}年${month}月${day}日`;
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function updateArticleMetadata(blog, lang) {
    const title = localized(blog.title, lang);
    const summary = localized(blog.excerpt, lang);
    const fullTitle = `${title} — Zichen Zhao`;
    const { originalLanguage } = container.dataset;
    const categories = JSON.parse(container.dataset.categories);
    const time = document.createElement('time');
    time.dateTime = blog.date;
    time.textContent = displayDate(blog.date, lang);
    document.getElementById('article-meta').replaceChildren(time, document.createTextNode(` · ${categories[blog.category] || blog.category} · ${originalLanguage}`));
    document.getElementById('article-title').textContent = title;
    document.getElementById('article-summary').textContent = summary;
    document.title = fullTitle;
    document.querySelector('meta[name="description"]').content = summary;
    document.querySelector('meta[property="og:title"]').content = fullTitle;
    document.querySelector('meta[property="og:description"]').content = summary;
    const articleUrl = language => `${location.origin}/${language}/blog-detail.html?id=${encodeURIComponent(blog.id)}`;
    document.querySelector('link[rel="canonical"]').href = articleUrl(lang);
    document.querySelector('link[hreflang="en"]').href = articleUrl('en');
    document.querySelector('link[hreflang="zh-CN"]').href = articleUrl('zh');
    document.querySelector('meta[property="og:url"]').content = articleUrl(lang);
}

const container = document.querySelector('.markdown-content');
if (container) {
    const lang = document.body.dataset.lang === 'zh' ? 'zh' : 'en';
    const id = new URLSearchParams(location.search).get('id');
    const languageLink = document.querySelector('.language-link');
    if (id && languageLink) languageLink.href = `/${lang === 'zh' ? 'en' : 'zh'}/blog-detail.html?id=${encodeURIComponent(id)}`;
    let ready = false;
    let highlighted = false;
    let typesetStarted = false;

    async function enhanceArticle() {
        if (!ready) return;
        if (window.hljs && !highlighted) {
            highlighted = true;
            for (const code of container.querySelectorAll('pre code')) window.hljs.highlightElement(code);
        }
        if (window.MathJax?.typesetPromise && !typesetStarted) {
            typesetStarted = true;
            try {
                await window.MathJax.startup?.promise;
                await window.MathJax.typesetPromise([container]);
            } catch (error) {
                console.error('Unable to typeset article math:', error);
            }
        }
    }

    window.addEventListener('load', enhanceArticle);
    (async () => {
        let source = '';
        try {
            if (!id) throw new Error('Article ID is missing');
            const listResponse = await fetch('/data/blogs.json', { cache: 'no-cache' });
            if (!listResponse.ok) throw new Error(`Blog list request failed: ${listResponse.status}`);
            const blogs = await listResponse.json();
            const blog = blogs.find(item => item.id === id);
            if (!blog) throw new Error(`Unknown article ID: ${id}`);
            updateArticleMetadata(blog, lang);
            source = '/' + blog.file;
            container.dataset.markdownSrc = source;
            const response = await fetch(`${source}?t=${Date.now()}`, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Markdown request failed: ${response.status}`);
            if (!window.marked) throw new Error('Markdown renderer did not load');
            const draft = renderMarkdown(await response.text(), source);
            container.replaceChildren(...draft.childNodes);
        } catch (error) {
            console.error('Unable to load article Markdown:', error);
            const message = document.createElement('p');
            message.textContent = source ? container.dataset.loadError : container.dataset.notFound;
            const link = document.createElement('a');
            link.href = source || `/${lang}/blog.html`;
            link.textContent = source ? container.dataset.readMarkdown : container.dataset.backToList;
            container.replaceChildren(message, link);
            container.setAttribute('aria-busy', 'false');
            return;
        }
        container.setAttribute('aria-busy', 'false');
        ready = true;
        await enhanceArticle();
    })();
}
