import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderSite } from './build-site.mjs';

const root = new URL('../', import.meta.url);
const output = new URL('_site/', root);
const imageConverter = fileURLToPath(new URL('img/convert-jpeg-to-webp.py', root));
const pages = [...renderSite().keys()];
const publicPaths = [
  'index.html', 'research.html', 'blog.html', 'blog-detail.html', 'interests.html', 'awards.html',
  'google7fe17f6c56942898.html', 'robots.txt', 'sitemap.xml',
  'blog', 'css', 'data/blogs.json', 'data/music.json', 'files', 'img', 'js',
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output);
for (const name of [...pages, ...publicPaths]) {
  fs.cpSync(new URL(name, root), new URL(name, output), {
    recursive: true,
    filter: source => source !== imageConverter,
  });
}
console.log(`Packaged ${pages.length} localized pages and public assets in _site/.`);
