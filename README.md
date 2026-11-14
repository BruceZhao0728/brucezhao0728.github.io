# Zichen Zhao’s personal website / 赵子辰的个人网站

A bilingual static website published to GitHub Pages by GitHub Actions. The site build renders both language editions from shared templates and paired Chinese and English copy.

## Where to edit

| Path | Purpose |
| --- | --- |
| `data/pages/` | Page copy, SEO descriptions, captions, and interface text. Each entry puts `zh` beside `en`. Start here when editing the site. |
| `data/pages/shared.json` | Navigation, footer, and shared labels, including blog categories. |
| `templates/` | Page layouts, image references, and shared header and footer markup. |
| `en/` and `zh/` | Generated English and Chinese HTML. Git ignores these files. |
| `blog/*.md` and `blog/images/` | Original-language article bodies and their images. The shared article viewers load Markdown directly. |
| `data/blogs.json` | Article IDs, Markdown paths, dates, categories, bilingual titles, and summaries used by both the blog list and article viewer. |
| `data/music.json` | The single music catalog, including the displayed 480 px cover paths. |
| `css/site.css` and `js/` | Site styling and browser behavior. `js/vendor/` contains the Markdown parser and its license. |
| `img/` | Display-sized 480/960 px photos and album covers, the homepage illustration, and favicon. |
| `files/` | Public CV PDFs, maintained separately by the site owner. |
| Root `*.html`, `sitemap.xml`, `robots.txt` | Language redirects, sitemap, and crawl rules. Edit these only when routes change. |
| `scripts/` | Site builder, checker, Pages packager, and optional image conversion helper. |

For example, edit `hero.description` in `data/pages/home.json` to update the introduction in both languages. Research, awards, and interests have their own files in the same directory. The [bilingual content design](docs/bilingual-content.md) describes the templates and how to include a paragraph in only one language.

## Local preview and checks

```sh
npm ci
./start.sh
```

`start.sh` builds the site and opens a local Python HTTP server. To check a change, run the following commands.

```sh
npm run build
npm run check
```

Open `http://localhost:8000/`. The root URL uses the visitor’s saved choice or browser language. Direct `/en/` and `/zh/` URLs stay in their respective language. Run `npm run build` after changing content, templates, or browser scripts. `npm run check` reports stale HTML and validates local links and assets without writing any files.

- Edit article bodies in `blog/*.md`. When adding an article or changing its listing details, update `data/blogs.json` and rebuild the lists.
- Article links use `/en/blog-detail.html?id=…` and `/zh/blog-detail.html?id=…`. Root page URLs redirect for compatibility. The older per-article `/en/blog/*.html` and `/zh/blog/*.html` URLs were removed, and shared viewer URLs have generic social-preview metadata.
- The build updates versioned URLs for `js/site.js`, `js/article.js`, and `js/music-player.js` when those scripts change.

## Images

The site keeps only the WebP sizes it displays: 480 px for thumbnails and album covers, plus 960 px for larger page images and gallery links. They live directly under `img/index/` and `img/interests/`; the homepage illustration and favicon are separate. The larger original photos were removed from the current checkout and remain recoverable from Git history. Article images in `blog/images/` are unaffected.

To add a photo, install Pillow and generate both sizes from a source file outside the repository:

```sh
python3 -m pip install Pillow
python3 scripts/convert-to-webp.py /path/to/photo.jpg img/interests/travel
```

Use `--only-480` for an album cover. Use `--remove-source` only when you intend to delete the input after conversion. Add album covers to `data/music.json`.

For travel memories and the photo gallery, add the entries directly in `data/pages/interests.json`. Put a new trip in `travel.trips`, a new photo for that trip in its `photos` array, or a standalone gallery photo in `gallery.photos`. Array order determines display order. Put both WebP variants in `img/interests/travel/` or `img/interests/gallery/`, and set `file` to the filename without `-480.webp` or `-960.webp`. The build reads the dimensions from the WebP files automatically. Gallery photos also take a bilingual `caption` and an optional `tile` such as `2x1` (default `1x1`). Run `npm run build` and `npm run check` after editing.

## Publishing

In the repository's **Settings → Pages**, select **GitHub Actions** as the source under **Build and deployment**. The [Pages workflow](.github/workflows/pages.yml) builds, checks, and packages the site on pushes to `main`, then deploys the `_site/` artifact. Pull requests to `main` run the build and checks. You can also run **Publish GitHub Pages** manually from the Actions tab on `main`.

Commit the source files to publish a change. The artifact contains the localized pages, root redirects, original blog posts, and their public assets. To assemble the same artifact locally, run `npm run build`, `npm run check`, and `npm run package:pages`.
