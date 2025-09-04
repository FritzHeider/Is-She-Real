
# IsSheReal — Pro ESM (GitLab + Cloudflare Pages)

Includes:
- ES module split (`/js` + `styles.css`)
- Optional **API enrichment** toggle (localStorage: `isshereal:api`)
- **GitHub posting cadence** heuristic (daytime vs night activity)

## Deploy (GitLab → Cloudflare Pages)

```bash
git init
git remote add origin https://gitlab.com/<your-group>/isshereal.git
git add .
git commit -m "ESM + API toggle + GitHub cadence"
git push -u origin main
```

Cloudflare Pages:
- Framework: **None**
- Build command: *(blank)*
- Output dir: `/`
- Add custom domain in Pages after first deploy.

## API Enrichment
If you deploy the FastAPI or Worker backend:
- Set Pages **Environment Variable** `VITE_API_BASE` *(optional for future bundlers)*.
- In this static build, paste the URL in the UI input (top card) and click **Use API**.
- The app will call `${API_BASE}/fetch?url=...` for HTML snapshot.

## GitHub Cadence Heuristic
We fetch `/users/:handle/events/public` and compute a day/night ratio on latest events.
- Score boost if ≥60% of events occur during 8:00–19:59 local time.

