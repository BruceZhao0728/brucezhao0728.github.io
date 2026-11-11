# Zichen Zhao’s personal website / 赵子辰的个人网站

A bilingual static website served directly from this GitHub Pages repository. The public HTML files are the editable pages; there is no page-generation step.

## Where to edit

| Path | Purpose |
| --- | --- |
| `en/` and `zh/` | English and Chinese pages. Edit both editions directly when changing shared content. |
| `blog/*.md` and `blog/images/` | Article bodies in their original language and their images. The shared article viewers load Markdown directly. |
| `data/blogs.json` | Article IDs, Markdown paths, dates, categories, bilingual titles, and summaries used by the article viewers. |
| `data/music.json` | Editable music collection. `data/music-optimized.json` is its generated, browser-ready copy. |
| `css/` and `js/` | Site styling and browser behavior. `js/vendor/` contains the Markdown parser and its license. |
| `img/` | Original photos, album covers, the illustration, and favicon. `img/optimized/` contains generated smaller versions. |
| `files/` | Public CV PDFs, maintained separately by the site owner. |
| Root `*.html`, `sitemap.xml`, `robots.txt` | Language redirects, sitemap, and crawl rules. Edit these only when routes change. |
| `scripts/` | Site checker, image optimizer, and an optional image conversion helper. |

## Local preview and checks

```sh
npm ci
npm run check
python3 -m http.server 8000
```

Open `http://localhost:8000/`. The root URL uses the visitor’s saved choice or browser language. Direct `/en/` and `/zh/` URLs stay in their respective language. Nothing in `npm run check` rewrites the pages.

- Edit content and markup directly in the matching `en/*.html` and `zh/*.html` files. There is no `site-src/` directory or site build that can overwrite those edits.
- Edit an existing article body in `blog/*.md`. When adding an article or changing its listing details, update `data/blogs.json` and the cards in both `en/blog.html` and `zh/blog.html`; `npm run check` verifies that the cards match the article IDs.
- Article links use `/en/blog-detail.html?id=…` and `/zh/blog-detail.html?id=…`. Root page URLs redirect for compatibility. The older per-article `/en/blog/*.html` and `/zh/blog/*.html` URLs were removed, and shared viewer URLs have generic social-preview metadata.
- When `js/article.js` changes, update its `?v=` value in both article viewer HTML files so browsers fetch the new script.

## Images

Original photos in `img/index/` and `img/interests/` remain available for full-size gallery links. Pages use smaller WebP files in `img/optimized/` through `src` and `srcset`. To add an image, put the original in `img/`, reference it in the page, run `npm run optimize:images`, then use the generated 480 px and (when applicable) 960 px paths in the page HTML. The image optimizer reads the public pages and music data; it **does not modify `en/` or `zh/`**. It removes stale files only from `img/optimized/`.

`scripts/convert-to-webp.py` is an optional preparation helper that requires Pillow. Article images live in `blog/images/` and are not processed by the image optimizer.

## Publishing

GitHub Pages serves the repository root. A local edit or commit does not change the live site; pushing the committed files updates it. The two CV PDFs remain public and are maintained separately.
