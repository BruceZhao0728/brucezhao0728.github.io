# Zichen Zhao’s personal website / 赵子辰的个人网站

A bilingual, static personal website for GitHub Pages. The source and generated pages stay in this repository.

## Local workflow

```sh
npm ci
npm run build
npm run check
python3 -m http.server 8000
```

Open `http://localhost:8000/`. The root route chooses English or Chinese from the visitor’s stored choice or browser language. Direct `/en/` and `/zh/` URLs always keep their stated language.

## Where to edit

- `site-src/legacy/` contains the original page content used to generate the localized home, research, interests, and awards pages. Keep English and Chinese passages paired; the build extracts one language per edition.
- `data/blogs.json` contains the bilingual titles and summaries of the 18 original-language articles. Article pages fetch their bodies directly from `blog/*.md` when opened. Editing an existing article body only requires publishing the changed Markdown file; adding an article or changing its title, summary, or date also requires `npm run build`.
- `data/papers.json`, `data/updates.json`, and `data/music.json` contain research, updates, and music data.
- `scripts/build-site.mjs` creates the `/en/` and `/zh/` pages, one shared article viewer per language, root compatibility redirects, sitemap, and optimized image variants. Commit generated output with source changes so GitHub Pages can serve it without a build service.
- `js/article.js` reads the article ID from the viewer URL, loads its title and summary from `data/blogs.json`, then fetches and renders its Markdown. `js/vendor/marked.umd.js` is the locally served Markdown parser (MIT license in the same directory). Since the viewer is shared, social previews use generic article metadata.
- Article links use `/en/blog-detail.html?id=…` or `/zh/blog-detail.html?id=…`. The former per-article `/en/blog/*.html` and `/zh/blog/*.html` pages were removed, so those URLs no longer work.
- `css/editorial.css` contains the new visual layer; `css/style.css` provides legacy content layout rules.
- `js/photo-gallery.js` opens Interests photos in a keyboard-accessible viewer. Photo links still open the original image without JavaScript.
- `img/illustrations/research-and-life.webp` is the original generated homepage illustration. The existing bridge photo remains in the homepage About section.

The two CV PDFs in `files/` are linked from Research. They are maintained separately by the site owner.

## Deployment

GitHub Pages serves the repository root. Build and check locally before committing. Publishing requires a separate push; local builds and commits do not update the live website.
