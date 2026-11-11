import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blogs = JSON.parse(fs.readFileSync(path.join(root, 'data/blogs.json'), 'utf8'));
const pages = ['index','research','blog','interests','awards'];
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const generated = [];
for (const lang of ['en','zh']) {
  for (const page of pages) generated.push(`${lang}/${page}.html`);
  for (const blog of blogs) generated.push(`${lang}/blog/${blog.id}.html`);
}
for (const file of generated) {
  const html = fs.readFileSync(path.join(root,file), 'utf8');
  const $ = cheerio.load(html);
  const lang = file.slice(0,2);
  check($('html').attr('lang') === (lang === 'zh' ? 'zh-CN' : 'en'), `${file}: HTML language`);
  check($('main h1').length === 1, `${file}: exactly one page heading`);
  check($('title').text().trim().length > 0 && $('meta[name="description"]').attr('content'), `${file}: title and description`);
  check($('link[rel="canonical"]').length === 1 && $('link[hreflang="en"]').length === 1 && $('link[hreflang="zh-CN"]').length === 1, `${file}: canonical and language links`);
  check(!html.includes('To be filled') && !html.includes('尚未公开'), `${file}: publication placeholder`);
  check(!html.includes('>undefined<'), `${file}: missing translated label`);
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
for (const lang of ['en','zh']) {
  const $ = cheerio.load(fs.readFileSync(path.join(root,lang,'blog.html'),'utf8'));
  check($('.blog-card a[href]').length === blogs.length, `${lang}: article links`);
  check($('#blog-category option[value="personal"]').length === 1, `${lang}: Personal category`);
  const interests = cheerio.load(fs.readFileSync(path.join(root,lang,'interests.html'),'utf8'));
  check(interests('img[loading="lazy"]').length >= 35, `${lang}: lazy photos`);
  check(interests('img:not([width]),img:not([height])').length === 0, `${lang}: image dimensions`);
}
for (const name of [...pages,'blog-detail']) {
  check(fs.readFileSync(path.join(root,`${name}.html`),'utf8').includes('location.replace'), `${name}: legacy redirect`);
}
check(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').match(/<loc>/g)?.length === generated.length, 'sitemap count');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Checked ${generated.length} localized pages, legacy routes, and local assets.`);
