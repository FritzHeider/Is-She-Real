from fastapi import FastAPI, HTTPException, Query, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, AnyHttpUrl
import httpx, socket, os

from .social import fetch_instagram, fetch_facebook, fetch_tiktok, TOKENS_STATE

APP_NAME = "isshereal-api"
TIMEOUT_S = float(os.getenv("TIMEOUT_S", "6.0"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
def current_api_key() -> str:
    """Return the latest API key value (optional per-request protection)."""

    return os.getenv("API_KEY", "")

app = FastAPI(title=APP_NAME, version="0.4.0")
app.add_middleware(GZipMiddleware, minimum_size=1024)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

def require_api_key(x_api_key: str | None = Header(default=None)):
    api_key = current_api_key()

    if not api_key:
        return True  # no protection enabled
    if x_api_key == api_key:
        return True
    raise HTTPException(status_code=401, detail="invalid api key")

class EnrichIn(BaseModel):
    url: AnyHttpUrl
    timeout_ms: int = 6000

@app.get("/health")
async def health():
    return {"ok": True, "service": APP_NAME, "version": "0.4.0"}

@app.get("/admin/health")
async def admin_health():
    """Readiness: shows which tokens are present (no outbound calls)."""
    return {"ok": True, "tokens": TOKENS_STATE()}

@app.get("/dns", dependencies=[Depends(require_api_key)])
def dns(domain: str = Query(..., min_length=1)):
    try:
        addrs = socket.getaddrinfo(domain, 80, proto=socket.IPPROTO_TCP)
        ips = sorted({a[4][0] for a in addrs})
        return {"domain": domain, "ips": ips}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/fetch", dependencies=[Depends(require_api_key)])
async def fetch(url: AnyHttpUrl, timeout_ms: int = 6000):
    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=float(timeout_ms)/1000.0,
            headers={"user-agent": "isshereal/0.4"}
        ) as cx:
            r = await cx.get(str(url))
        return {
            "status": r.status_code,
            "headers": dict(r.headers),
            "content_type": r.headers.get("content-type", ""),
            "bytes": len(r.content),
            "text": r.text[:200_000],
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@app.post("/enrich", dependencies=[Depends(require_api_key)])
async def enrich(inp: EnrichIn):
    page = await fetch(inp.url, inp.timeout_ms)
    try:
        host = httpx.URL(str(inp.url)).host
        addrs = socket.getaddrinfo(host, 80, proto=socket.IPPROTO_TCP)
        ips = sorted({a[4][0] for a in addrs})
        dns_info = {"domain": host, "ips": ips}
    except Exception:
        dns_info = {"error": "dns-failed"}
    return {"page": page, "dns": dns_info}

# ---------- Social endpoints ----------
@app.get("/social/instagram", dependencies=[Depends(require_api_key)])
async def instagram(user_id: str | None = None, username: str | None = None):
    try:
        return await fetch_instagram(user_id=user_id, username=username, timeout=TIMEOUT_S)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@app.get("/social/facebook", dependencies=[Depends(require_api_key)])
async def facebook(page_id: str | None = None, username: str | None = None):
    try:
        return await fetch_facebook(page_id=page_id, username=username, timeout=TIMEOUT_S)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@app.get("/social/tiktok", dependencies=[Depends(require_api_key)])
async def tiktok(username: str):
    try:
        return await fetch_tiktok(username=username, timeout=TIMEOUT_S)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
