import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFile(path.join(root, name), 'utf8');
const pageImagePaths = new Set();

function originalImage(value) {
  if (!value) return null;
  if (/^(?:https?:|data:|\/\/)/i.test(value)) return null;
  const pathname = new URL(value, 'https://example.com/').pathname;
  const original = pathname.replace('/img/optimized/', '/img/').replace(/-(?:480|960)\.webp$/, '.webp');
  if (!/^\/img\/(?:index|interests)\//.test(original)) return null;
  return original;
}

// The public pages are the source of truth. Reading them never changes their HTML.
for (const lang of ['en', 'zh']) {
  for (const page of ['index', 'research', 'blog', 'interests', 'awards', 'blog-detail']) {
    const $ = cheerio.load(await read(`${lang}/${page}.html`));
    $('img[src]').each((_, element) => {
      const source = originalImage($(element).attr('src'));
      if (source) pageImagePaths.add(source);
    });
  }
}

const music = JSON.parse(await read('data/music.json'));
const imagePaths = new Set(pageImagePaths);
for (const songs of Object.values(music)) {
  for (const song of songs) {
    const source = originalImage(song.cover);
    if (source) imagePaths.add(source);
  }
}

const variants = {};
const expected = new Set();
for (const image of [...imagePaths].sort()) {
  const input = path.join(root, image.slice(1));
  const metadata = await sharp(input).metadata();
  const widths = pageImagePaths.has(image) && metadata.width > 480 ? [480, 960] : [480];
  variants[image] = {};
  for (const width of widths) {
    const destination = image.replace('/img/', '/img/optimized/').replace(/\.webp$/i, `-${width}.webp`);
    const output = path.join(root, destination.slice(1));
    await fs.mkdir(path.dirname(output), { recursive: true });
    await sharp(input).resize({ width: Math.min(metadata.width, width), withoutEnlargement: true }).webp({ quality: 72, effort: 4 }).toFile(output);
    variants[image][width] = destination;
    expected.add(destination);
  }
}

// Only this directory is build-owned; original photos are never removed.
const optimizedRoot = path.join(root, 'img/optimized');
async function removeStaleVariants(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await removeStaleVariants(file);
    else if (entry.isFile() && entry.name.endsWith('.webp') && !expected.has('/' + path.relative(root, file).split(path.sep).join('/'))) await fs.rm(file);
  }
}
await removeStaleVariants(optimizedRoot);

const optimizedMusic = Object.fromEntries(Object.entries(music).map(([genre, songs]) => [
  genre,
  songs.map(song => ({ ...song, cover: variants[originalImage(song.cover)]?.[480] || song.cover }))
]));
await fs.writeFile(path.join(root, 'data/music-optimized.json'), JSON.stringify(optimizedMusic, null, 2) + '\n');
console.log(`Optimized ${imagePaths.size} images without changing the public pages.`);
