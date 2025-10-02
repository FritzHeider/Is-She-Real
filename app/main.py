from fastapi import FastAPI, HTTPException, Query, Header, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, AnyHttpUrl
import httpx, socket, os
from PIL import UnidentifiedImageError

from .detector import detect_image_bytes
from .normalize import error_json
from .social import (
    fetch_instagram,
    fetch_facebook,
    fetch_tiktok,
    fetch_twitter,
    fetch_youtube,
    TOKENS_STATE,
)

APP_NAME = "isshereal-api"
TIMEOUT_S = float(os.getenv("TIMEOUT_S", "6.0"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
def current_api_key() -> str:
    """Return the latest API key value (optional per-request protection)."""

    return os.getenv("API_KEY", "")

app = FastAPI(title=APP_NAME, version="0.5.0")
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


class InstagramQuery(BaseModel):
    user_id: str | None = None
    username: str | None = None


class FacebookQuery(BaseModel):
    page_id: str | None = None
    username: str | None = None


class TikTokQuery(BaseModel):
    username: str


class TwitterQuery(BaseModel):
    username: str | None = None
    user_id: str | None = None


class YouTubeQuery(BaseModel):
    channel_id: str | None = None
    handle: str | None = None
    custom_url: str | None = None


class SocialAssessIn(BaseModel):
    instagram: InstagramQuery | None = None
    facebook: FacebookQuery | None = None
    tiktok: TikTokQuery | None = None
    twitter: TwitterQuery | None = None
    youtube: YouTubeQuery | None = None

@app.get("/health")
async def health():
    return {"ok": True, "service": APP_NAME, "version": "0.5.0"}

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

@app.post("/detect/image", dependencies=[Depends(require_api_key)])
async def detect_image_route(file: UploadFile | None = File(default=None), url: str | None = Form(default=None)):
    if file is None and (url is None or not url.strip()):
        raise HTTPException(status_code=400, detail="no image provided")

    data: bytes | None = None
    if file is not None:
        data = await file.read()
    else:
        target = url.strip() if url else url
        if not target:
            raise HTTPException(status_code=400, detail="no image provided")
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=TIMEOUT_S) as cx:
                resp = await cx.get(target)
            resp.raise_for_status()
            data = resp.content
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=exc.response.status_code, detail="failed to download image") from exc
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not data:
        raise HTTPException(status_code=400, detail="empty image payload")

    try:
        result = detect_image_bytes(data)
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=400, detail="unsupported image format") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="image analysis failed") from exc

    return result

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


@app.get("/social/twitter", dependencies=[Depends(require_api_key)])
async def twitter(username: str | None = None, user_id: str | None = None):
    try:
        return await fetch_twitter(username=username, user_id=user_id, timeout=TIMEOUT_S)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.get("/social/youtube", dependencies=[Depends(require_api_key)])
async def youtube(channel_id: str | None = None, handle: str | None = None, custom_url: str | None = None):
    try:
        return await fetch_youtube(
            channel_id=channel_id,
            handle=handle,
            custom_url=custom_url,
            timeout=TIMEOUT_S,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


async def _safe_social_call(name: str, coro):
    try:
        return await coro
    except HTTPException as exc:
        detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
        return error_json(exc.status_code, f"{name} error: {detail}")
    except Exception as exc:
        return error_json(502, f"{name} error: {exc}")


@app.post("/social/assess", dependencies=[Depends(require_api_key)])
async def social_assess(payload: SocialAssessIn):
    results: dict[str, dict] = {}

    if payload.instagram is not None:
        results["instagram"] = await _safe_social_call(
            "instagram",
            fetch_instagram(
                user_id=payload.instagram.user_id,
                username=payload.instagram.username,
                timeout=TIMEOUT_S,
            ),
        )

    if payload.facebook is not None:
        results["facebook"] = await _safe_social_call(
            "facebook",
            fetch_facebook(
                page_id=payload.facebook.page_id,
                username=payload.facebook.username,
                timeout=TIMEOUT_S,
            ),
        )

    if payload.tiktok is not None:
        results["tiktok"] = await _safe_social_call(
            "tiktok",
            fetch_tiktok(
                username=payload.tiktok.username,
                timeout=TIMEOUT_S,
            ),
        )

    if payload.twitter is not None:
        results["twitter"] = await _safe_social_call(
            "twitter",
            fetch_twitter(
                username=payload.twitter.username,
                user_id=payload.twitter.user_id,
                timeout=TIMEOUT_S,
            ),
        )

    if payload.youtube is not None:
        results["youtube"] = await _safe_social_call(
            "youtube",
            fetch_youtube(
                channel_id=payload.youtube.channel_id,
                handle=payload.youtube.handle,
                custom_url=payload.youtube.custom_url,
                timeout=TIMEOUT_S,
            ),
        )

    scores = []
    flags: list[str] = []
    for name, data in results.items():
        if not isinstance(data, dict):
            continue
        if data.get("ok"):
            metrics = data.get("metrics") or {}
            score = metrics.get("score")
            if isinstance(score, (int, float)):
                scores.append(float(score))
            for flag in metrics.get("flags", []):
                flags.append(f"{name}: {flag}")
        else:
            detail = data.get("error") or data.get("detail") or "unknown error"
            flags.append(f"{name}: {detail}")

    average_score = round(sum(scores) / len(scores), 3) if scores else None

    return {
        "ok": True,
        "results": results,
        "summary": {
            "platforms_checked": list(results.keys()),
            "average_score": average_score,
            "flags": flags,
            "tokens": TOKENS_STATE(),
        },
    }
