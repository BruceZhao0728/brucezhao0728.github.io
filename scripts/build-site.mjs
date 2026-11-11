import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'https://brucezhao0728.github.io';
const read = async name => fs.readFile(path.join(root, name), 'utf8');
const articleScriptVersion = createHash('sha256').update(await read('js/article.js')).digest('hex').slice(0, 12);
const write = async (name, value) => {
  const target = path.join(root, name);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, value);
};
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const han = value => /[\u3400-\u9fff]/.test(value || '');
const plain = html => cheerio.load(`<div>${html}</div>`).text().trim();
const localized = (value, lang) => typeof value === 'object' && value !== null ? (value[lang] || value.en || value.zh || '') : (value || '');
const pages = ['index', 'research', 'blog', 'interests', 'awards'];
const labels = {
  en: { home: 'Home', research: 'Research', blog: 'Blog', interests: 'Interests', awards: 'Awards', skip: 'Skip to content', menu: 'Open navigation', language: 'Language', contact: 'Get in touch', updated: 'Recent updates', read: 'Read article', original: 'Original language', categories: 'Category', tags: 'Tag', search: 'Search titles and summaries', sort: 'Sort', all: 'All', newest: 'Newest first', oldest: 'Oldest first', personal: 'Personal', life: 'Life', tech: 'Tech', study: 'Study', back: 'All articles', cvEn: 'English CV', cvZh: 'Chinese CV' },
  zh: { home: '主页', research: '研究', blog: '博客', interests: '兴趣', awards: '荣誉', skip: '跳转到正文', menu: '打开导航菜单', language: '语言', contact: '联系我', updated: '近期动态', read: '阅读文章', original: '原文语言', categories: '分类', tags: '标签', search: '搜索标题与摘要', sort: '排序', all: '全部', newest: '最新优先', oldest: '最早优先', personal: '个人', life: '生活', tech: '技术', study: '学习', back: '所有文章', cvEn: '英文简历', cvZh: '中文简历' }
};
const metadata = {
  index: { en: ['Zichen Zhao — Research, writing & life', 'Meet Zichen Zhao: information security student, researcher, writer, and curious traveler.'], zh: ['赵子辰 — 科研、写作与生活', '认识赵子辰：信息安全专业学生，分享研究、学习笔记与生活见闻。'] },
  research: { en: ['Research — Zichen Zhao', 'Research projects in program analysis, AI software protection, and agent systems.'], zh: ['研究 — 赵子辰', '程序分析、人工智能软件保护与智能体系统相关的研究项目。'] },
  blog: { en: ['Blog — Zichen Zhao', 'Notes on computer vision, cryptography, learning, and life.'], zh: ['博客 — 赵子辰', '记录计算机视觉、密码学、学习与生活的文章。'] },
  interests: { en: ['Interests — Zichen Zhao', 'Music, travel, badminton, and photography beyond research.'], zh: ['兴趣 — 赵子辰', '科研之外的音乐、旅行、羽毛球与摄影。'] },
  awards: { en: ['Awards — Zichen Zhao', 'Selected scholarships, competitions, and honors.'], zh: ['荣誉 — 赵子辰', '奖学金、竞赛与其他荣誉记录。'] }
};
const navPath = (lang, page) => `/${lang}/${page === 'index' ? '' : page + '.html'}`;
const articlePath = (lang, id) => `/${lang}/blog-detail.html?id=${encodeURIComponent(id)}`;
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function displayDate(value, lang) {
  const [year, month, day] = value.split('-').map(Number);
  return lang === 'zh' ? `${year}年${month}月${day}日` : `${monthNames[month - 1]} ${day}, ${year}`;
}

function shell({ lang, page, title, description, body, scripts = '' }) {
  const L = labels[lang];
  const canonical = `${base}${navPath(lang, page)}`;
  const other = lang === 'en' ? 'zh' : 'en';
  const locale = lang === 'zh' ? 'zh_CN' : 'en_US';
  const nav = pages.map(name => `<li><a href="${navPath(lang, name)}"${name === (page === 'blog-detail' ? 'blog' : page) ? ' aria-current="page"' : ''}>${L[name === 'index' ? 'home' : name]}</a></li>`).join('');
  return `<!doctype html>
<html lang="${lang === 'zh' ? 'zh-CN' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${base}${navPath('en', page)}">
  <link rel="alternate" hreflang="zh-CN" href="${base}${navPath('zh', page)}">
  <meta property="og:type" content="${page === 'blog-detail' ? 'article' : 'website'}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="${locale}">
  <meta name="twitter:card" content="summary">
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/editorial.css">
  ${page === 'blog-detail' ? '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.12.0/styles/atom-one-dark.min.css" media="print" onload="this.media=\'all\'">' : ''}
  <script>document.documentElement.classList.add('js')</script>
</head>
<body data-page="${page}" data-lang="${lang}">
  <a class="skip-link" href="#main">${L.skip}</a>
  <header class="site-header"><div class="site-header-inner">
    <a class="site-brand" href="/${lang}/" aria-label="Zichen Zhao — ${L.home}">Zichen <span>Zhao</span><small>赵子辰</small></a>
    <button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="${L.menu}"><span></span><span></span><span></span></button>
    <nav id="site-nav" class="site-nav" aria-label="${lang === 'zh' ? '主导航' : 'Main navigation'}"><ul>${nav}</ul></nav>
    <a class="language-link" href="${navPath(other, page)}" data-language="${other}" lang="${other === 'zh' ? 'zh-CN' : 'en'}" aria-label="${L.language}: ${other === 'zh' ? '中文' : 'English'}">${other === 'zh' ? '中文' : 'EN'}</a>
  </div></header>
  <main id="main" class="site-main">${body}</main>
  <footer class="site-footer"><div class="container footer-inner"><p>© 2026 Zichen Zhao · ${lang === 'zh' ? '感谢来访' : 'Thanks for visiting'}</p><div><a href="mailto:brucezhaozichen@126.com">Email</a><a href="https://github.com/BruceZhao0728" rel="noopener noreferrer">GitHub</a></div></div></footer>
  <script src="/js/site.js" defer></script>${scripts}
</body></html>\n`;
}

function pairedBr($, element, lang) {
  const html = $(element).html() || '';
  const parts = html.split(/<br\s*\/?\s*>/i);
  if (parts.length !== 2) return;
  const first = plain(parts[0]);
  const second = plain(parts[1]);
  if (first && second && han(first) !== han(second)) {
    $(element).html(lang === 'zh' ? (han(first) ? parts[0] : parts[1]) : (han(first) ? parts[1] : parts[0]));
  }
}

function localizePageSource(name, lang) {
  const source = pageSources[name].replace(/<!--[\s\S]*?-->/g, '');
  const $ = cheerio.load(source);
  const main = $('.main-content .container').first();
  main.find('*').contents().filter((_, node) => node.type === 'comment').remove();
  // Existing prose uses English and Chinese in adjacent paragraphs and list items.
  main.find('li, p, h3, h4').each((_, node) => pairedBr($, node, lang));
  main.find('h3').each((_, node) => {
    const next = $(node).next();
    if (!next.is('h3,h4')) return;
    if (!(/award-title|timeline-title|athlete-info/.test($(node).attr('class') || '') || next.hasClass('timeline-subtitle') || $(node).parent().hasClass('athlete-info'))) return;
    const a = $(node).text().trim();
    const b = next.text().trim();
    if (!a || !b || han(a) === han(b)) return;
    if (lang === 'zh' && han(b) || lang === 'en' && !han(b)) $(node).html(next.html() || '');
    next.remove();
  });
  main.find('p').each((_, node) => {
    const current = $(node);
    const next = current.nextAll('p').first();
    if (!next.length || current.parent()[0] !== next.parent()[0]) return;
    if (current.attr('class') || next.attr('class')) return;
    const between = current.nextUntil(next);
    if (between.filter((_, el) => el.type === 'tag' && el.name !== 'br').length) return;
    const a = current.text().trim();
    const b = next.text().trim();
    if (!a || !b || han(a) || !han(b)) return;
    if (lang === 'zh') current.remove(); else next.remove();
    between.filter('br').remove();
  });
  main.find('h1,h2,h3,h4,h5,h6,p,label,option,strong').each((_, node) => {
    const element = $(node);
    if (element.children().length) return;
    const text = element.text();
    if (!text.includes(' | ')) return;
    const parts = text.split(/\s+\|\s+/);
    if (parts.length !== 2 || han(parts[0]) === han(parts[1])) return;
    element.text(lang === 'zh' ? (han(parts[0]) ? parts[0] : parts[1]) : (han(parts[0]) ? parts[1] : parts[0]));
  });
  main.find('img').each((_, node) => {
    const img = $(node);
    const src = img.attr('src');
    if (src?.startsWith('img/')) img.attr('src', '/' + src);
  });
  main.find('a').each((_, node) => {
    const a = $(node);
    const href = a.attr('href');
    if (href?.startsWith('files/')) a.attr('href', '/' + href);
    else if (href && pages.some(page => href === `${page}.html`)) a.attr('href', navPath(lang, href.slice(0, -5)));
    if (a.attr('target') === '_blank') a.attr('rel', 'noopener noreferrer');
  });
  if (name === 'index') {
    const hero = main.find('.hero-section');
    hero.html(`<div class="hero-copy">
      <p class="eyebrow">${lang === 'zh' ? '你好，我是' : 'Hello, I’m'}</p>
      <h1>${lang === 'zh' ? '赵子辰' : 'Zichen Zhao'}<span class="hero-name-secondary">${lang === 'zh' ? ' Zichen Zhao' : ' 赵子辰'}</span></h1>
      <p class="hero-lede">${lang === 'zh' ? '上海交通大学信息安全专业四年级本科生，关注程序分析、人工智能与软件保护。这里也记录我的写作和生活。' : 'I’m a fourth-year information security student at Shanghai Jiao Tong University, exploring program analysis, AI, and software protection. I also write about what I learn and the life around it.'}</p>
      <p class="hero-email"><a href="mailto:brucezhaozichen@126.com">brucezhaozichen@126.com</a><span>·</span><a href="mailto:bruce0728@sjtu.edu.cn">bruce0728@sjtu.edu.cn</a></p>
      <div class="hero-paths">${['research','blog','interests'].map((p, i) => `<a class="path-card" href="${navPath(lang,p)}"><span class="path-number">0${i+1}</span><strong>${labels[lang][p]}</strong><span aria-hidden="true">↗</span></a>`).join('')}</div>
    </div><div class="hero-art"><img src="/img/illustrations/research-and-life.webp" alt="${lang === 'zh' ? '坐在书桌前的学生，周围有科研、音乐、旅行与羽毛球元素' : 'Student at a desk surrounded by research, music, travel, and badminton motifs'}" width="1182" height="815" fetchpriority="high" decoding="async"></div>`);
    const aboutCard = hero.nextAll('.section').first().find('.card').first();
    aboutCard.after(`<figure class="about-photo"><img src="/img/index/avatar.webp" alt="${lang === 'zh' ? '黄昏时的跨河大桥' : 'Bridge over a river at dusk'}" loading="lazy"><figcaption>${lang === 'zh' ? '镜头中的一刻 · 摄影' : 'A moment through my lens · Photography'}</figcaption></figure>`);
    aboutCard.add(aboutCard.next('.about-photo')).wrapAll('<div class="about-layout"></div>');
    main.find('#updates-container').html(updates.map(u => `<article class="update-row"><time datetime="${u.date}">${displayDate(u.date,lang)}</time><div><h3>${esc(localized(u.title,lang))}</h3><p>${esc(localized(u.content,lang))}</p></div></article>`).join(''));
  }
  if (name === 'research') {
    main.find('.section').first().find('p.hero-subtitle').text(lang === 'zh' ? '探索程序分析、人工智能软件保护与智能体系统。' : 'Exploring program analysis, AI software protection, and agent systems.');
    if (lang === 'zh') {
      main.find('h3').each((_, node) => {
        const text = $(node).text().trim();
        if (text.includes('Program Analysis')) $(node).text('🖥️ 程序分析');
        if (text.includes('Agent Systems')) $(node).text('🤖 智能体系统');
      });
      main.find('.timeline-date').each((_, node) => {
        const value = $(node).text().trim();
        const match = value.match(/^(\d{2})\/(\d{4}) - (\d{2})\/(\d{4})$/);
        if (match) $(node).text(`${match[2]}年${Number(match[1])}月－${match[4]}年${Number(match[3])}月`);
      });
    }
    main.find('#papers-container').html(papers.map(p => {
      const originalTitle = lang === 'zh' ? `<p class="paper-original">英文原题：<span lang="en">${esc(localized(p.title,'en'))}</span></p>` : '';
      return `<article class="paper-card card"><p class="eyebrow">${esc(localized(p.venue,lang))} · ${p.year}</p><h3>${esc(localized(p.title,lang))}</h3>${originalTitle}<p>${esc(p.authors)}</p><p>${esc(localized(p.abstract,lang))}</p><a class="text-link" href="${esc(p.links.arxiv)}" target="_blank" rel="noopener noreferrer">arXiv ↗</a></article>`;
    }).join(''));
    main.find('#btn-send-email').text(lang === 'zh' ? '发送邮件' : 'Send email');
    main.find('#btn-resume-en').text(labels[lang].cvEn);
    main.find('#btn-resume-zh').text(labels[lang].cvZh);
  }
  if (name === 'awards') {
    main.find('.section').first().find('p.hero-subtitle').text(lang === 'zh' ? '记录学习与探索路上的几个里程碑。' : 'Selected milestones from study, research, and the things I love.');
    if (lang === 'en') {
      const organizations = { '上海交通大学': 'Shanghai Jiao Tong University', '中国信息安全评测中心': 'China Information Technology Security Evaluation Center', '中国电工技术协会': 'China Electrotechnical Society', '高等学校大学外语教学研究会': 'Foreign Language Teaching and Research Association of Chinese Universities', '上海市教育委员会': 'Shanghai Municipal Education Commission' };
      main.find('.award-org').each((_, node) => { const value = $(node).text().trim(); if (organizations[value]) $(node).text(organizations[value]); });
    }
    main.find('.award-card').each((_, node) => {
      if ($(node).text().includes('National Information Security Competition') || $(node).text().includes('全国大学生信息安全竞赛')) {
        $(node).find('.award-date').text('2026');
        $(node).find('.award-content').append(`<p><a class="text-link" href="https://arxiv.org/abs/2607.17603" target="_blank" rel="noopener noreferrer">${lang === 'zh' ? '相关论文 ↗' : 'Related paper ↗'}</a></p>`);
      }
    });
  }
  if (name === 'interests') {
    main.find('.section').first().find('p.hero-subtitle').text(lang === 'zh' ? '科研之外，我也爱音乐、旅行、羽毛球和摄影。' : 'Beyond research: music, travel, badminton, and photography.');
    main.find('#random-btn').text(lang === 'zh' ? '🎲 随机推荐一首' : '🎲 Surprise me');
    main.find('#music-cover-link').attr('aria-label', lang === 'zh' ? '查看音乐视频' : 'View music video');
    main.find('#music-cover-overlay-text').text(lang === 'zh' ? '查看 MV / Live' : 'View MV / Live');
    main.find('.music-lyrics').attr('lang', 'zh-CN');
    main.find('.athlete-info p').each((_, node) => {
      const p = $(node);
      const text = p.text().trim();
      const category = text.match(/^Category:\s*(.*?)\s*\|\s*(.*)$/);
      const country = text.match(/^Country:\s*(.*)$/);
      if (category) p.text(lang === 'zh' ? `项目：${category[2]}` : `Category: ${category[1]}`);
      if (country && lang === 'zh') p.text(`国家：${({ China:'中国', Korea:'韩国', Malaysia:'马来西亚' })[country[1]] || country[1]}`);
    });
    main.find('.section').last().find('blockquote').html(lang === 'zh' ? '仰望星空，脚踏实地。<br>生活就像海洋，只有意志坚强的人才能到达彼岸。<br><em>PS：你发现彩蛋了吗？</em>' : 'Look up at the stars, and keep your feet on the ground.<br>Life is an ocean; perseverance carries us across.<br><em>PS: Did you spot the inside joke?</em>');
    main.find('.timeline-photos').each((tripIndex, node) => {
      const gallery = $(node);
      const place = gallery.closest('.timeline-content').find('.timeline-title').first().text().trim();
      const photos = gallery.find('img').toArray();
      photos.forEach((photo, index) => {
        const img = $(photo);
        const link = $('<a></a>').addClass('travel-photo-link').attr({
          href: img.attr('src'),
          'data-photo-group': `travel-${tripIndex}`,
          'data-caption': place,
          'aria-label': lang === 'zh' ? `查看${place}的第${index + 1}张照片` : `View photo ${index + 1} from ${place}`
        });
        img.attr('alt', '');
        img.replaceWith(link);
        link.append(img).append(`<span class="photo-index" aria-hidden="true">${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}</span>`);
      });
    });
    main.find('.athlete-card').each((_, node) => {
      const card = $(node);
      const img = card.find('.athlete-image img');
      const name = card.find('.athlete-info h3').first().text().trim();
      const link = $('<a></a>').addClass('athlete-photo-link').attr({ href: img.attr('src'), 'data-photo-group': 'athletes', 'data-caption': name, 'aria-label': lang === 'zh' ? `查看${name}的照片` : `View photo of ${name}` });
      img.attr('alt', '');
      img.replaceWith(link);
      link.append(img);
    });
    main.find('.photo-item').each((_, node) => {
      const item = $(node);
      const p = item.find('.photo-overlay p');
      pairedBr($, p[0], lang);
      const caption = p.text().trim();
      const img = item.find('img').attr('alt', '');
      const link = $('<a></a>').addClass(item.attr('class')).attr({ href: img.attr('src'), 'data-photo-group': 'gallery', 'data-caption': caption, 'aria-label': lang === 'zh' ? `查看照片：${caption}` : `View photo: ${caption}` });
      link.html(item.html());
      item.replaceWith(link);
    });
    main.append(`<dialog id="photo-lightbox" class="photo-lightbox" aria-label="${lang === 'zh' ? '照片查看器' : 'Photo viewer'}"><div class="lightbox-frame"><button class="lightbox-close" type="button" aria-label="${lang === 'zh' ? '关闭照片' : 'Close photo'}">×</button><img class="lightbox-image" alt="" width="1600" height="1000"><div class="lightbox-footer"><button class="lightbox-prev" type="button" aria-label="${lang === 'zh' ? '上一张' : 'Previous photo'}">←</button><p class="lightbox-caption"></p><span class="lightbox-count"></span><button class="lightbox-next" type="button" aria-label="${lang === 'zh' ? '下一张' : 'Next photo'}">→</button></div></div></dialog>`);
  }
  return main.html() || '';
}

const pageSources = Object.fromEntries(await Promise.all(['index','research','interests','awards'].map(async name => [name, await read(`site-src/pages/${name}.html`)])));
const blogs = JSON.parse(await read('data/blogs.json'));
const papers = JSON.parse(await read('data/papers.json'));
const updates = JSON.parse(await read('data/updates.json')).sort((a,b) => b.date.localeCompare(a.date));
const music = JSON.parse(await read('data/music.json'));

function blogIndex(lang) {
  const L = labels[lang];
  const categories = ['all','tech','study','life','personal'];
  const cards = [...blogs].sort((a,b) => b.date.localeCompare(a.date)).map(blog => `<article class="blog-card" data-category="${esc(blog.category)}" data-tags="${esc((blog.tags || []).join('|'))}" data-date="${blog.date}" data-search="${esc(`${localized(blog.title,lang)} ${localized(blog.excerpt,lang)}`.toLowerCase())}"><a class="blog-card-link" href="${articlePath(lang,blog.id)}"><span class="eyebrow"><time datetime="${blog.date}">${displayDate(blog.date,lang)}</time> · ${esc(L[blog.category] || blog.category)} · ${lang === 'zh' ? '中文原文' : 'Original in Chinese'}</span><h2>${esc(localized(blog.title,lang))}</h2><p>${esc(localized(blog.excerpt,lang))}</p><span class="text-link">${L.read} ↗</span></a></article>`).join('');
  return `<div class="container"><header class="page-intro"><h1 class="text-center">${L.blog}</h1><p class="text-center hero-subtitle">${lang === 'zh' ? '写下我所学，也写下我所见。文章保留创作时的原文语言。' : 'What I learn, make, and notice. Articles remain in their original language.'}</p></header><section class="blog-tools" aria-label="${lang === 'zh' ? '文章筛选' : 'Article filters'}"><label>${L.search}<input id="blog-search" type="search" placeholder="${L.search}"></label><label>${L.categories}<select id="blog-category">${categories.map(c => `<option value="${c}">${L[c] || c}</option>`).join('')}</select></label><label>${L.tags}<select id="blog-tag"><option value="">${L.all}</option>${[...new Set(blogs.flatMap(b => b.tags || []))].sort().map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select></label><label>${L.sort}<select id="blog-sort"><option value="newest">${L.newest}</option><option value="oldest">${L.oldest}</option></select></label></section><p id="blog-count" class="result-count" aria-live="polite"></p><div id="blog-grid" class="blog-grid">${cards}</div><p id="blog-empty" hidden>${lang === 'zh' ? '没有找到匹配的文章。' : 'No matching articles.'}</p></div>`;
}

function articlePage(lang) {
  const L = labels[lang];
  const title = lang === 'zh' ? '博客文章 — 赵子辰' : 'Blog article — Zichen Zhao';
  const description = lang === 'zh' ? '阅读赵子辰的博客文章。' : 'Read an article from Zichen Zhao’s blog.';
  const loading = lang === 'zh' ? '正在加载文章…' : 'Loading article…';
  const noScript = lang === 'zh' ? '查看文章列表' : 'Browse articles';
  const scripts = `<script>window.MathJax={tex:{inlineMath:[["$","$"],["\\\\(","\\\\)"]],displayMath:[["$$","$$"],["\\\\[","\\\\]"]]}}</script><script defer src="/js/vendor/marked.umd.js"></script><script defer src="/js/article.js?v=${articleScriptVersion}"></script><script defer src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.12.0/highlight.min.js"></script><script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>`;
  const body = `<div class="container article-layout"><a class="text-link" href="${navPath(lang,'blog')}">← ${L.back}</a><article class="article"><header class="article-header"><p class="eyebrow" id="article-meta"></p><h1 id="article-title">${lang === 'zh' ? '博客文章' : 'Blog article'}</h1><p id="article-summary"></p></header><div class="markdown-content" lang="zh-CN" aria-busy="true"><p>${loading}</p></div><noscript><p><a href="${navPath(lang,'blog')}">${noScript}</a></p></noscript></article></div>`;
  return shell({ lang, page: 'blog-detail', title, description, scripts, body });
}
function redirectPage(page) {
  const target = page === 'index' ? '' : `${page}.html`;
  const fallback = page === 'blog-detail' ? 'blog.html' : target;
  const extra = page === 'blog-detail' ? `const id=new URLSearchParams(location.search).get('id');const dest=id?'blog-detail.html?id='+encodeURIComponent(id):'blog.html';` : `const dest=${JSON.stringify(target)};`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Zichen Zhao</title>${page === 'blog-detail' ? '' : `<link rel="canonical" href="${base}/en/${target}">`}<script>try{const saved=localStorage.getItem('site-language');const lang=saved==='en'||saved==='zh'?saved:(navigator.language||'en').toLowerCase().startsWith('zh')?'zh':'en';${extra}location.replace('/'+lang+'/'+dest+location.hash)}catch(e){location.replace('/en/${fallback}')}</script></head><body><main><h1>Zichen Zhao · 赵子辰</h1><p>Choose a language / 选择语言</p><a href="/en/${fallback}">English</a> · <a href="/zh/${fallback}">中文</a></main></body></html>\n`;
}

// Generate responsive image variants; originals remain available for full-size gallery links.
const imagePaths = new Set(['/img/index/avatar.webp']);
for (const name of ['index','interests']) {
  const $ = cheerio.load(pageSources[name].replace(/<!--[\s\S]*?-->/g, ''));
  $('img[src^="img/"]').each((_, el) => imagePaths.add('/' + $(el).attr('src')));
}
for (const songs of Object.values(music)) for (const song of songs) if (song.cover?.startsWith('img/')) imagePaths.add('/' + song.cover);
const variants = {};
const expectedVariants = new Set();
for (const image of [...imagePaths].sort()) {
  const input = path.join(root, image.slice(1));
  const meta = await sharp(input).metadata();
  const out = {};
  for (const width of [480, 960]) {
    if (width > 480 && meta.width <= 480) continue;
    const actual = Math.min(meta.width, width);
    const destination = image.replace('/img/', '/img/optimized/').replace(/\.webp$/i, `-${width}.webp`);
    expectedVariants.add(destination);
    await fs.mkdir(path.dirname(path.join(root, destination.slice(1))), { recursive: true });
    await sharp(input).resize({ width: actual, withoutEnlargement: true }).webp({ quality: 72, effort: 4 }).toFile(path.join(root, destination.slice(1)));
    out[width] = destination;
  }
  variants[image] = { ...out, width: meta.width, height: meta.height };
}
// Remove only stale files under the build-owned optimized image directory.
const optimizedRoot = path.join(root, 'img/optimized');
async function removeStaleVariants(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await removeStaleVariants(file);
    else if (entry.isFile() && entry.name.endsWith('.webp') && !expectedVariants.has('/' + path.relative(root, file).split(path.sep).join('/'))) await fs.rm(file);
  }
}
await removeStaleVariants(optimizedRoot);
await write('data/music-optimized.json', JSON.stringify(Object.fromEntries(Object.entries(music).map(([genre,songs]) => [genre,songs.map(song => ({ ...song, cover: variants['/'+song.cover]?.[480] || song.cover }))])), null, 2) + '\n');

for (const lang of ['en','zh']) {
  for (const page of pages) {
    const [title, description] = metadata[page][lang];
    let body = page === 'blog' ? blogIndex(lang) : `<div class="container legacy-content">${localizePageSource(page,lang)}</div>`;
    const $ = cheerio.load(body);
    $('[src^="/img/"]').each((_, el) => {
      const image = $(el);
      const data = variants[image.attr('src')];
      if (!data) return;
      const srcset = [`${data[480]} ${Math.min(data.width, 480)}w`];
      if (data[960]) srcset.push(`${data[960]} ${Math.min(data.width, 960)}w`);
      image.attr('width', String(data.width)).attr('height', String(data.height)).attr('src', data[480]).attr('srcset', srcset.join(', ')).attr('sizes', '(max-width: 680px) 100vw, 50vw').attr('decoding', 'async');
      if (page === 'interests') {
        image.attr('loading', image.attr('id') === 'album-cover' ? 'eager' : 'lazy');
        if (image.hasClass('travel-photo')) image.attr('sizes', '(max-width: 600px) 45vw, (max-width: 900px) 42vw, 23vw');
        else if (image.closest('.photo-item').length) {
          const tile = image.closest('.photo-item');
          const wide = tile.hasClass('photo-item-2x1') || tile.hasClass('photo-item-2x2');
          image.attr('sizes', wide ? '(max-width: 600px) 90vw, (max-width: 900px) 66vw, 50vw' : '(max-width: 600px) 45vw, (max-width: 900px) 33vw, 25vw');
        } else if (image.closest('.athlete-image').length) image.attr('sizes', '(max-width: 600px) 90vw, (max-width: 900px) 45vw, 32vw');
        else if (image.attr('id') === 'album-cover') image.attr('sizes', '(max-width: 600px) 90vw, 32vw');
      }
    });
    body = $('body').html() || body;
    const scripts = page === 'interests' ? '<script src="/js/music-player.js" defer></script><script src="/js/photo-gallery.js" defer></script>' : '';
    await write(`${lang}/${page === 'index' ? 'index' : page}.html`, shell({ lang, page, title, description, body, scripts }));
  }
}
for (const lang of ['en','zh']) await write(`${lang}/blog-detail.html`, articlePage(lang));
for (const page of [...pages, 'blog-detail']) await write(`${page}.html`, redirectPage(page));
const sitemapPaths = [...['en','zh'].flatMap(lang => pages.map(page => navPath(lang,page)))];
await write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapPaths.map(url => `<url><loc>${base}${url}</loc></url>`).join('')}</urlset>\n`);
await write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
await write('.nojekyll', '');
console.log(`Generated ${sitemapPaths.length} localized pages, 2 shared article viewers, and ${imagePaths.size} responsive image sets.`);
