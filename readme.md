# issHereal API (FastAPI) — Everything + Improvements

- GZip enabled, CORS configurable
- Optional `API_KEY` header protection (set in .env)
- Social endpoints for IG/FB/TikTok with normalized outputs
- `/admin/health` shows which tokens are present (no outbound calls)
- `deploy.sh` reads `.env` and pushes Fly secrets

## Local
```bash
a
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
- `GET /social/twitter?username=...` or `?user_id=...`
- `GET /social/youtube?channel_id=...`, `?handle=@...` or `?custom_url=...`
- `POST /social/assess` – aggregate multiple platforms and return averaged credibility scoring (see below)

- `POST /detect/image`  form-data: `file` upload **or** `url` pointing to a direct image

**Notes:** IG/FB Graph are ID-first. TikTok endpoints are scope/approval-gated.

### Social scoring & new API tokens

Each social endpoint now returns a `metrics` payload containing:

- `score`: heuristically-derived credibility score in `[0, 1]`
- `components`: transparent breakdown of the scoring inputs
- `derived`: helpful derived metrics such as follower/following ratios
- `flags`: warnings like "Account is very new"

`POST /social/assess` accepts a body such as:

```json
{
  "instagram": {"user_id": "17841400000000000"},
  "twitter": {"username": "example"},
  "youtube": {"handle": "@channel"}
}
```

The response merges the individual platform responses, averages the
available `metrics.score` values and surfaces any warnings across platforms.

Additional environment variables (set locally or in Vercel) enable the extra
providers:

- `X_BEARER_TOKEN` (or `TWITTER_BEARER_TOKEN`) – Twitter/X API v2 user lookup
- `YOUTUBE_API_KEY` – YouTube Data API v3 channel lookups
# Is-SHe-Real
