# Zichen Zhao’s personal website / 赵子辰的个人网站

A bilingual static website served directly from this GitHub Pages repository. The public HTML files are the editable pages; there is no page-generation step.

## Where to edit

| Path | Purpose |
| --- | --- |
| `en/` and `zh/` | English and Chinese pages. Edit both editions directly when changing shared content. |
| `blog/*.md` and `blog/images/` | Original-language article bodies and their images. The shared article viewers load Markdown directly. |
| `data/blogs.json` | Article IDs, Markdown paths, dates, categories, bilingual titles, and summaries used by the article viewers. |
| `data/music.json` | The single music catalog, including the displayed 480 px cover paths. |
| `css/site.css` and `js/` | Site styling and browser behavior. `js/vendor/` contains the Markdown parser and its license. |
| `img/` | Display-sized 480/960 px photos and album covers, the homepage illustration, and favicon. |
| `files/` | Public CV PDFs, maintained separately by the site owner. |
| Root `*.html`, `sitemap.xml`, `robots.txt` | Language redirects, sitemap, and crawl rules. Edit these only when routes change. |
| `scripts/` | Site checker and an optional image conversion helper. |

## Local preview and checks

```sh
npm ci
npm run check
python3 -m http.server 8000
```

Open `http://localhost:8000/`. The root URL uses the visitor’s saved choice or browser language. Direct `/en/` and `/zh/` URLs stay in their respective language. Nothing in `npm run check` rewrites the pages.

- Edit content and markup directly in the matching `en/*.html` and `zh/*.html` files.
- Edit an existing article body in `blog/*.md`. When adding an article or changing its listing details, update `data/blogs.json` and the cards in both `en/blog.html` and `zh/blog.html`; `npm run check` verifies that the cards match the article IDs.
- Article links use `/en/blog-detail.html?id=…` and `/zh/blog-detail.html?id=…`. Root page URLs redirect for compatibility. The older per-article `/en/blog/*.html` and `/zh/blog/*.html` URLs were removed, and shared viewer URLs have generic social-preview metadata.
- When `js/article.js` changes, update its `?v=` value in both article viewer HTML files so browsers fetch the new script.

## Images

The site keeps only the WebP sizes it displays: 480 px for thumbnails and album covers, plus 960 px for larger page images and gallery links. They live directly under `img/index/` and `img/interests/`; the homepage illustration and favicon are separate. The larger original photos were removed from the current checkout and remain recoverable from Git history. Article images in `blog/images/` are unaffected.

To add a photo, install Pillow and generate both sizes from a source file outside the repository:

```sh
python3 -m pip install Pillow
python3 scripts/convert-to-webp.py /path/to/photo.jpg img/interests/travel
```

Use `--only-480` for an album cover; use `--remove-source` only when you intend to delete the input after conversion. Add the generated paths to the relevant English and Chinese pages, or to `data/music.json`. The converter does not edit HTML or music data.

## Publishing

GitHub Pages serves the repository root. A local edit or commit does not change the live site; pushing the committed files updates it. The two CV PDFs remain public and are maintained separately.
