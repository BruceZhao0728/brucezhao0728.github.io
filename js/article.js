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

const container = document.querySelector('.markdown-content[data-markdown-src]');
if (container) {
    const source = container.dataset.markdownSrc;
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
        try {
            const response = await fetch(`${source}?t=${Date.now()}`, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Markdown request failed: ${response.status}`);
            if (!window.marked) throw new Error('Markdown renderer did not load');
            const draft = renderMarkdown(await response.text(), source);
            container.replaceChildren(...draft.childNodes);
        } catch (error) {
            console.error('Unable to load article Markdown:', error);
            const message = document.createElement('p');
            message.textContent = document.body.dataset.lang === 'zh' ? '文章加载失败。' : 'The article could not be loaded.';
            const link = document.createElement('a');
            link.href = source;
            link.textContent = document.body.dataset.lang === 'zh' ? '阅读 Markdown 原文' : 'Read the original Markdown';
            container.replaceChildren(message, link);
            container.setAttribute('aria-busy', 'false');
            return;
        }
        container.setAttribute('aria-busy', 'false');
        ready = true;
        await enhanceArticle();
    })();
}
