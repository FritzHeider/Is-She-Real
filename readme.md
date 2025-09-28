# issHereal API (FastAPI) — Everything + Improvements

- GZip enabled, CORS configurable
- Optional `API_KEY` header protection (set in .env)
- Social endpoints for IG/FB/TikTok with normalized outputs
- `/admin/health` shows which tokens are present (no outbound calls)
- `deploy.sh` reads `.env` and pushes Fly secrets

## Local
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill tokens (and API_KEY if you want to protect endpoints)
uvicorn app.main:app --reload --port 8080
```

## Deploy (Vercel)
```bash
# Install Vercel CLI if you don't already have it
npm install -g vercel

# First deployment creates the project
vercel --prod
```

Environment variables can be configured with `vercel env`. The API will be
served from the default Serverless Function entrypoint configured in
`vercel.json`.

## Deploy (Fly.io)
```bash
chmod +x deploy.sh
./deploy.sh
```

## Test (locally)
```bash
pip install -r requirements-dev.txt
pytest -q
```

## Endpoints
- `GET /health`
- `GET /admin/health`
- `GET /fetch?url=`
- `GET /dns?domain=`
- `POST /enrich`  body: `{"url": "https://example.com"}`
- `GET /social/instagram?user_id=...` (preferred) or `?username=...`
- `GET /social/facebook?page_id=...` (preferred) or `?username=...`
- `GET /social/tiktok?username=...`

- `POST /detect/image`  form-data: `file` upload **or** `url` pointing to a direct image

**Notes:** IG/FB Graph are ID-first. TikTok endpoints are scope/approval-gated.
# Is-SHe-Real
