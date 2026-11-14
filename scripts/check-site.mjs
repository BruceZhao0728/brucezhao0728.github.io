import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { renderSite } from './build-site.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blogs = JSON.parse(fs.readFileSync(path.join(root, 'data/blogs.json'), 'utf8'));
const music = JSON.parse(fs.readFileSync(path.join(root, 'data/music.json'), 'utf8'));
const pages = ['index','research','blog','interests','awards'];
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const generated = renderSite();
for (const [file, expected] of generated) {
  const html = fs.readFileSync(path.join(root,file), 'utf8');
  check(html === expected, `${file}: generated HTML is out of date. Run npm run build.`);
  const $ = cheerio.load(html);
  const lang = file.slice(0,2);
  check($('html').attr('lang') === (lang === 'zh' ? 'zh-CN' : 'en'), `${file}: HTML language`);
  check($('main h1').length === 1, `${file}: exactly one page heading`);
  check($('title').text().trim().length > 0 && $('meta[name="description"]').attr('content'), `${file}: title and description`);
  check($('link[rel="stylesheet"][href="/css/site.css"]').length === 1, `${file}: consolidated stylesheet`);
  check(!html.includes('/img/optimized/'), `${file}: old image directory`);
  check($('link[rel="canonical"]').length === 1 && $('link[hreflang="en"]').length === 1 && $('link[hreflang="zh-CN"]').length === 1, `${file}: canonical and language links`);
  check(!html.includes('To be filled') && !html.includes('尚未公开'), `${file}: publication placeholder`);
  check(!html.includes('>undefined<'), `${file}: missing translated label`);
  if (file.endsWith('/blog-detail.html')) {
    check($('article .markdown-content[aria-busy="true"]').length === 1, `${file}: shared article viewer`);
    check($('script[src="/js/vendor/marked.umd.js"]').length === 1, `${file}: browser Markdown renderer`);
    check($('script[src^="/js/article.js?v="]').length === 1, `${file}: versioned article loader`);
  }
  $('a[href],img[src],script[src],link[href]').each((_,el) => {
    const value = $(el).attr('href') || $(el).attr('src');
    if (!value || !value.startsWith('/')) return;
    const target = value.split(/[?#]/)[0];
    const local = path.join(root,target.slice(1));
    check(fs.existsSync(local) || target === '/en/' || target === '/zh/', `${file}: missing ${target}`);
  });
  $('img').each((_, el) => {
    check(Number($(el).attr('width')) > 0 && Number($(el).attr('height')) > 0, `${file}: image dimensions`);
    const sources = ($(el).attr('srcset') || '').split(',').map(item => item.trim().split(' ')[0]).filter(Boolean);
    for (const source of sources) if (source.startsWith('/')) check(fs.existsSync(path.join(root, source.slice(1))), `${file}: missing ${source}`);
  });
}
for (const blog of blogs) {
  const source = path.join(root, blog.file);
  check(fs.existsSync(source), `${blog.id}: missing Markdown file`);
  if (!fs.existsSync(source)) continue;
  const markdown = fs.readFileSync(source, 'utf8');
  for (const [, image] of markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)) {
    if (/^(?:https?:|data:|\/\/)/i.test(image)) continue;
    check(fs.existsSync(path.resolve(path.dirname(source), image)), `${blog.id}: missing Markdown image ${image}`);
  }
}
check(!blogs.some(blog => blog.id === 'welcome'), 'removed welcome article is still listed');
check(!fs.existsSync(path.join(root, 'blog/welcome.md')), 'removed welcome Markdown still exists');
check(!fs.existsSync(path.join(root, 'data/music-optimized.json')), 'duplicate music catalog still exists');
check(!fs.existsSync(path.join(root, 'img/optimized')), 'old optimized image directory still exists');
for (const directory of ['img/index', 'img/interests']) {
  const pending = [path.join(root, directory)];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory()) pending.push(path.join(current, entry.name));
      else if (entry.name.endsWith('.webp')) check(/-(?:480|960)\.webp$/.test(entry.name), `${directory}: unoptimized original ${entry.name}`);
    }
  }
}
for (const songs of Object.values(music)) {
  for (const song of songs) {
    if (!song.cover?.startsWith('/')) continue;
    check(fs.existsSync(path.join(root, song.cover.slice(1))), `${song.id}: missing music cover ${song.cover}`);
  }
}
for (const lang of ['en','zh']) {
  const home = cheerio.load(fs.readFileSync(path.join(root,lang,'index.html'),'utf8'));
  check(home('.hero-art img[src="/img/illustrations/research-and-life.webp"]').length === 1, `${lang}: homepage illustration`);
  check(home('.about-photo img[loading="lazy"]').length === 1, `${lang}: existing photo retained`);
  const research = cheerio.load(fs.readFileSync(path.join(root,lang,'research.html'),'utf8'));
  if (lang === 'zh') {
    check(/[\u3400-\u9fff]/.test(research('.paper-card h3').first().text()), 'zh: translated paper heading');
    check(/[\u3400-\u9fff]/.test(research('.paper-card .eyebrow').first().text()), 'zh: translated publication type');
  }
  const $ = cheerio.load(fs.readFileSync(path.join(root,lang,'blog.html'),'utf8'));
  check($('.blog-card a[href]').length === blogs.length, `${lang}: article links`);
  for (const blog of blogs) {
    const href = `/${lang}/blog-detail.html?id=${encodeURIComponent(blog.id)}`;
    check($('.blog-card-link').filter((_, el) => $(el).attr('href') === href).length === 1, `${lang}: missing article link ${blog.id}`);
  }
  check(!fs.existsSync(path.join(root, lang, 'blog')), `${lang}: obsolete article HTML directory`);
  check($('#blog-category option[value="personal"]').length === 1, `${lang}: Personal category`);
  check($('.blog-card time[datetime]').length === blogs.length, `${lang}: localized article dates`);
  const interests = cheerio.load(fs.readFileSync(path.join(root,lang,'interests.html'),'utf8'));
  check(interests('img[loading="lazy"]').length >= 35, `${lang}: lazy photos`);
  check(interests('img:not([width]),img:not([height])').length === 0, `${lang}: image dimensions`);
  check(interests('.travel-photo-link[href]').length === 25, `${lang}: travel photo links`);
  check(interests('.athlete-photo-link[href]').length === 3, `${lang}: badminton photo links`);
  check(interests('.photo-gallery a.photo-item[href][data-caption]').length === 14, `${lang}: gallery links and captions`);
  check(interests('#photo-lightbox').length === 1, `${lang}: photo viewer`);
  const awards = cheerio.load(fs.readFileSync(path.join(root,lang,'awards.html'),'utf8'));
  const competition = awards('.award-card').filter((_, el) => /National Information Security Competition|全国大学生信息安全竞赛/.test(awards(el).text()));
  check(competition.find('.award-date').text().trim() === '2026', `${lang}: competition year`);
  check(competition.find('a[href="https://arxiv.org/abs/2607.17603"]').length === 1, `${lang}: related paper`);
}
for (const name of [...pages,'blog-detail']) {
  check(fs.readFileSync(path.join(root,`${name}.html`),'utf8').includes('location.replace'), `${name}: legacy redirect`);
}
check(fs.readFileSync(path.join(root,'blog-detail.html'),'utf8').includes("blog-detail.html?id="), 'legacy article ID redirect');
const sitemap = fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
check(sitemap.match(/<loc>/g)?.length === pages.length * 2, 'sitemap count');
check(!sitemap.includes('/blog/'), 'sitemap contains deleted article pages');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Checked ${generated.size} localized pages, legacy routes, and local assets.`);
