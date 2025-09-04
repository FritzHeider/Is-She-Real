
# IsSheReal — ES Modules Split (GitLab + Cloudflare Pages)

Minimal multi-file split for clean diffs and future growth.

## Structure
- `index.html` — static entry
- `styles.css` — light theme tokens + UI
- `js/*` — ES modules (utils, geo, fetchers, scoring, app, main)

## Deploy on GitLab + Cloudflare Pages
1. Create a GitLab project `isshereal` and push this folder:
```bash
git init
git remote add origin https://gitlab.com/<your-group>/isshereal.git
git add .
git commit -m "Initial ESM split"
git push -u origin main
```
2. Cloudflare Dashboard → **Pages** → **Create project** → Connect **GitLab** → select repo.
3. Build settings: Framework **None**, Build command *(blank)*, Output dir `/`.
4. Deploy → add `isshereal.com` under **Custom domains**.

## Notes
- Logo is embedded as a data URL in `index.html` (header/hero/verdict/footer/favicon).
- Client-only fetches use CORS-friendly endpoints; for broader coverage, add the FastAPI or Worker backend later.
