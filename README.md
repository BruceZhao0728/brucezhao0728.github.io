# Zichen Zhao’s personal website / 赵子辰的个人网站

A bilingual static site served directly from this repository by GitHub Pages. The repository contains both editable source and generated pages because Pages does not run the build during deployment.

## Repository map

| Path | Purpose |
| --- | --- |
| `site-src/pages/` | Editable HTML for Home, Research, Interests, and Awards. Each file contains paired English and Chinese content; the build produces one language per page. |
| `blog/*.md` and `blog/images/` | Original-language article bodies and their images. The browser loads Markdown directly. |
| `data/blogs.json` | Article IDs, dates, categories, bilingual titles, and summaries. |
| `data/papers.json`, `data/updates.json`, `data/music.json` | Research, update, and music content. |
| `css/`, `js/` | Styles and browser scripts. `js/vendor/` contains the local Markdown parser and its license. |
| `img/` | Original photos, album covers, illustration, and favicon. |
| `scripts/` | Site builder, checker, and optional image conversion helper. |
| `en/`, `zh/`, root `*.html`, `sitemap.xml`, `robots.txt` | Generated pages and compatibility redirects, committed for GitHub Pages. |
| `img/optimized/`, `data/music-optimized.json` | Generated responsive image variants and music cover URLs, also committed. |
| `files/` | Public CV PDFs, updated separately by the site owner. |

## Edit and preview

```sh
npm ci
npm run build
npm run check
python3 -m http.server 8000
```

Open `http://localhost:8000/`. The root URL uses the visitor’s saved choice or browser language; direct `/en/` and `/zh/` URLs stay in that edition. Commit source changes **and** their generated output together before publishing.

- Edit page copy in `site-src/pages/` and the data files, then run the build and check.
- Edit an existing article body in `blog/*.md`; its shared viewer fetches the Markdown directly, so a build is unnecessary for body-only changes. Add an entry to `data/blogs.json` and rebuild when adding an article or changing its listing metadata.
- Article URLs use `/en/blog-detail.html?id=…` and `/zh/blog-detail.html?id=…`. Root page URLs redirect for compatibility. The older per-article `/en/blog/*.html` and `/zh/blog/*.html` URLs were removed; social previews of shared viewer URLs have generic article metadata.
- To prepare a new photo, `scripts/convert-to-webp.py` is an optional helper that requires Pillow. Add the resulting image to `img/`, reference it from the page source or music data, then rebuild.

## Why `img/` has similar images

The originals in `img/index/` and `img/interests/` are kept for full-size gallery links. The build creates smaller 480 px and, when the source is large enough, 960 px WebP variants under `img/optimized/`. Pages use these variants in `srcset` so a phone can download a smaller image; gallery links still open the original. The build removes stale generated variants. Article illustrations live separately in `blog/images/` and are not resized by this build.

## Publishing

GitHub Pages serves the repository root. A local build or commit does not change the live site; pushing the committed output updates it. The two CV PDFs remain public and are maintained separately.
