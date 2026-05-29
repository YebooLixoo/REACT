# REACT — Project Website

Project page for the paper:

> **Edge-based multimodal sensor data fusion with Vision-Language-Action (VLA) model for real-time autonomous vehicle accident avoidance**
> Fengze Yang, Bo Yu, Yang Zhou, Xuewen Luo, Zhengzhong Tu, Chenxi Liu
> *Engineering Applications of Artificial Intelligence* **180** (2026) 115186 · [DOI: 10.1016/j.engappai.2026.115186](https://doi.org/10.1016/j.engappai.2026.115186)

A self-contained static site (no build step) designed for GitHub Pages. Interactive result
charts use a locally vendored copy of [Chart.js](https://www.chartjs.org/) (no CDN needed, works offline).

## Structure
```
index.html              Single-page site (all sections)
css/style.css           Modern minimalist theme
js/charts.js            Chart.js configs + paper data (Tables 2-5, 8)
js/main.js              Nav, metric count-up, copy-BibTeX, figure lightbox, link config
js/chart.umd.min.js     Vendored Chart.js 4.4.6
static/images/          7 figures extracted from the paper + favicon
static/pdf/REACT.pdf    Paper PDF (PDF download button)
static/video/           (empty) drop the demo video here later
.nojekyll               Disable Jekyll on GitHub Pages
```

## Local preview
```bash
cd paper_website          # this directory
python3 -m http.server 8000
# open http://localhost:8000
```

## Things to fill in
Open **`js/main.js`** and edit the `LINKS` object at the top:
- `arxiv` — arXiv/preprint URL. Leave `""` to hide the arXiv button.
- `code`  — code repository URL. Leave `""` and the **Code** button becomes "Code (on request)" → emails the corresponding author.

Then, in **`index.html`**, replace `USERNAME` (in the `<meta>` / canonical tags) with your GitHub username
so social-share previews resolve correctly.

> The `<meta>` `og:url` / `og:image` / canonical tags assume the repo is named **`REACT`** (matching the `/REACT/`
> path segment in `https://<username>.github.io/REACT/`). If you name the repo something else, update that path
> segment in `index.html` too, or social-share previews and the canonical URL will 404. (Relative asset paths keep
> working regardless.)

### Demo video
A placeholder section (`#demo`) is in place. When the video is ready, replace the
`.video-placeholder` block in `index.html` — the file has a commented hook showing both a
self-hosted `<video>` and a YouTube/Vimeo `<iframe>` option.

## Deploy to GitHub Pages (project site)
Produces `https://<username>.github.io/REACT/`.
```bash
cd paper_website
git init
git add .
git commit -m "REACT project page"
# create the repo (requires gh CLI) — or create it on github.com and add the remote manually
gh repo create REACT --public --source=. --remote=origin --push
```
Then on GitHub: **Settings → Pages → Source = "Deploy from a branch", Branch = `main`, Folder = `/ (root)`**.
The site goes live at `https://<username>.github.io/REACT/` within ~1 minute.

## Notes
- All numbers on the page are transcribed verbatim from the published tables and were cross-checked
  against the source PDF.
- Figures are © the authors / Elsevier, reproduced here for academic dissemination. The official
  version of record is the Elsevier DOI link. Confirm your self-archiving rights before hosting
  `static/pdf/REACT.pdf` publicly (typically the accepted manuscript / preprint may be self-archived).
