# IsSheReal — Bot vs Human Checker (MVP)

Single-file static site ready for **GitLab + Cloudflare Pages**.

## Deploy

1. Create a new GitLab project named `isshereal` and push these files:

```bash
git init
git remote add origin https://gitlab.com/<your-group>/isshereal.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

2. In Cloudflare Dashboard → **Pages** → **Create project** → Connect **GitLab** → select this repo.

3. Build settings:
- Framework preset: **None**
- Build command: *(leave blank)*
- Output directory: `/`

4. Deploy. You’ll get a `*.pages.dev` URL, then add `isshereal.com` under **Custom domains**.
