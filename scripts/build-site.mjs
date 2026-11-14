import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const origin = 'https://brucezhao0728.github.io';
const pages = {
  index: 'home', research: 'research', blog: 'blog', interests: 'interests',
  awards: 'awards', 'blog-detail': 'article',
};
const navPages = ['index', 'research', 'blog', 'interests', 'awards'];
const languages = { en: { html: 'en', og: 'en_US' }, zh: { html: 'zh-CN', og: 'zh_CN' } };

const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const readJson = name => JSON.parse(read(name));
const readTemplate = name => read(`templates/${name}.html`).trimEnd();
const version = name => createHash('sha256').update(read(`js/${name}.js`)).digest('hex').slice(0, 12);
const pagePath = (locale, page) => `/${locale}/${page === 'index' ? '' : page + '.html'}`;
const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => entities[char]);

function localized(data, key, locale, source, optional = false) {
  const entry = key.split('.').reduce((value, part) => value?.[part], data);
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new Error(`${source}: expected a bilingual entry for "${key}"`);
  }
  if (optional && entry[locale] === undefined) return '';
  if (typeof entry[locale] !== 'string' || !entry[locale].trim()) {
    throw new Error(`${source}: expected a non-empty "${locale}" string for "${key}"`);
  }
  return entry[locale];
}

function render(template, context, values = {}) {
  const { data, locale, source } = context;
  const included = template.replace(
    /{{optional:([\w.]+)}}([\s\S]*?){{end}}/g,
    (_, key, body) => localized(data, key, locale, source, true) ? body : '',
  );
  return included.replace(/{{([^{}]+)}}/g, (_, token) => {
    const [type, key] = token.split(':');
    if (type === 'value' && Object.hasOwn(values, key)) return values[key];
    if (type === 'text') return escapeHtml(localized(data, key, locale, source));
    if (type === 'html') return localized(data, key, locale, source);
    throw new Error(`${source}: unknown template token "{{${token}}}"`);
  });
}

function formatDate(date, locale) {
  if (locale === 'zh') {
    const [year, month, day] = date.split('-').map(Number);
    return `${year}年${month}月${day}日`;
  }
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date));
}

function renderBlog(blogs, context, categories) {
  const { locale } = context;
  const card = readTemplate('blog-card');
  const option = (value, label) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
  const blogTags = [...new Set(blogs.flatMap(blog => blog.tags))].sort()
    .map(tag => option(tag, tag)).join('\n        ');
  const blogCategoryOptions = Object.entries(categories).map(([id, label]) => option(id, label)).join('\n        ');
  const blogCards = [...blogs].sort((a, b) => b.date.localeCompare(a.date)).map(blog => {
    const title = localized(blog, 'title', locale, `data/blogs.json (${blog.id})`);
    const excerpt = localized(blog, 'excerpt', locale, `data/blogs.json (${blog.id})`);
    const values = {
      title, excerpt, date: blog.date, category: blog.category, tags: blog.tags.join('|'),
      search: `${title} ${excerpt}`.toLocaleLowerCase(),
      categoryLabel: categories[blog.category] ?? blog.category,
      displayDate: formatDate(blog.date, locale),
      href: `${pagePath(locale, 'blog-detail')}?id=${encodeURIComponent(blog.id)}`,
    };
    const escaped = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, escapeHtml(value)]));
    return render(card, context, escaped).replaceAll('\n', '\n      ');
  }).join('\n      ');
  return { blogCards, blogTags, blogCategoryOptions };
}

function initialMusic(music) {
  const song = Object.values(music).flat()[0];
  if (!song) throw new Error('data/music.json: expected a song for the Interests page');
  const largerCover = song.cover.replace(/-480\.webp$/, '-960.webp');
  const srcset = song.cover.startsWith('/') && largerCover !== song.cover && fs.existsSync(path.join(root, largerCover))
    ? ` srcset="${escapeHtml(song.cover)} 480w, ${escapeHtml(largerCover)} 600w"`
    : '';
  return {
    albumCover: escapeHtml(song.cover),
    albumCoverSrcset: srcset,
    songTitleZh: escapeHtml(song.titleCn?.trim() || song.titleEn?.trim() || ''),
    songTitleEn: escapeHtml(song.titleEn?.trim() || song.titleCn?.trim() || ''),
    songArtist: escapeHtml(song.artist),
    songLyrics: song.initialDescription ?? song.description,
  };
}

export function renderSite() {
  const shared = readJson('data/pages/shared.json');
  const blogs = readJson('data/blogs.json');
  const music = initialMusic(readJson('data/music.json'));
  const layout = readTemplate('layout');
  const articleHead = readTemplate('article-head');
  const versions = { siteVersion: version('site'), articleVersion: version('article'), musicVersion: version('music-player') };
  const generated = new Map();

  for (const [page, name] of Object.entries(pages)) {
    const source = `data/pages/${name}.json`;
    const data = { ...readJson(source), shared };
    const template = readTemplate(name);
    for (const [locale, language] of Object.entries(languages)) {
      const context = { data, locale, source };
      const otherLocale = locale === 'en' ? 'zh' : 'en';
      const localPath = pagePath(locale, page);
      const isArticle = page === 'blog-detail';
      const categories = Object.fromEntries(Object.keys(shared.blog.categories).map(id => [
        id, localized(data, `shared.blog.categories.${id}`, locale, source),
      ]));
      const navigation = navPages.map(nav => {
        const label = escapeHtml(localized(data, `shared.nav.${nav}`, locale, source));
        const current = nav === (isArticle ? 'blog' : page) ? ' aria-current="page"' : '';
        return `<li><a href="${pagePath(locale, nav)}"${current}>${label}</a></li>`;
      }).join('');
      const values = { locale };
      if (page === 'blog') Object.assign(values, renderBlog(blogs, context, categories));
      if (page === 'interests') Object.assign(values, music);
      if (isArticle) values.blogCategories = escapeHtml(JSON.stringify(categories));

      const extraScripts = isArticle ? '\n  ' + render(readTemplate('article-scripts'), context, versions).replaceAll('\n', '\n  ')
        : page === 'interests'
          ? `\n  <script src="/js/music-player.js?v=${versions.musicVersion}" defer></script>\n  <script src="/js/photo-gallery.js" defer></script>`
          : '';
      const html = render(layout, context, {
        ...versions, locale, page, navigation, otherLocale,
        content: render(template, context, values),
        htmlLanguage: language.html, ogLocale: language.og,
        otherLanguage: languages[otherLocale].html,
        otherPath: pagePath(otherLocale, page),
        canonical: origin + localPath,
        englishUrl: origin + pagePath('en', page),
        chineseUrl: origin + pagePath('zh', page),
        pageType: isArticle ? 'article' : 'website',
        extraHead: isArticle ? articleHead : '',
        extraScripts,
      });
      const file = page === 'index' ? `${locale}/index.html` : localPath.slice(1);
      generated.set(file, html.replace(/^ +\n/gm, '') + '\n');
    }
  }
  return generated;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pages = renderSite();
  for (const [file, html] of pages) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), html);
  }
  console.log(`Generated ${pages.size} localized pages.`);
}
