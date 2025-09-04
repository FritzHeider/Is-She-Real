import os, httpx
from fastapi import HTTPException
from .normalize import norm_ok, error_json

IG_ACCESS_TOKEN = os.getenv("IG_ACCESS_TOKEN", "")
FB_ACCESS_TOKEN = os.getenv("FB_ACCESS_TOKEN", "")
TT_ACCESS_TOKEN = os.getenv("TT_ACCESS_TOKEN", "")

def TOKENS_STATE():
    return {
        "instagram": bool(IG_ACCESS_TOKEN),
        "facebook": bool(FB_ACCESS_TOKEN),
        "tiktok": bool(TT_ACCESS_TOKEN),
    }

async def fetch_instagram(user_id: str|None, username: str|None, timeout: float):
    if not IG_ACCESS_TOKEN:
        return error_json(501, "instagram not configured (IG_ACCESS_TOKEN missing)")
    if not user_id and username:
        return error_json(400, "instagram username->id mapping required; provide user_id")
    if not user_id:
        return error_json(400, "missing user_id")
    fields = "username,name,biography,website,followers_count,follows_count,media_count,profile_picture_url"
    url = f"https://graph.facebook.com/v19.0/{user_id}?fields={fields}&access_token={IG_ACCESS_TOKEN}"
    async with httpx.AsyncClient(timeout=timeout) as cx:
        r = await cx.get(url)
    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=r.text)
    j = r.json()
    return norm_ok("instagram", j, {
        "username": j.get("username"),
        "display_name": j.get("name"),
        "followers": j.get("followers_count"),
        "following": j.get("follows_count"),
        "media_count": j.get("media_count"),
        "has_bio": bool(j.get("biography")),
        "has_website": bool(j.get("website")),
        "profile_picture": bool(j.get("profile_picture_url")),
    })

async def fetch_facebook(page_id: str|None, username: str|None, timeout: float):
    if not FB_ACCESS_TOKEN:
        return error_json(501, "facebook not configured (FB_ACCESS_TOKEN missing)")
    if not page_id and username:
        return error_json(400, "facebook username->page_id mapping required; provide page_id")
    if not page_id:
        return error_json(400, "missing page_id")
    fields = "name,link,about,followers_count,fan_count,verification_status"
    url = f"https://graph.facebook.com/v19.0/{page_id}?fields={fields}&access_token={FB_ACCESS_TOKEN}"
    async with httpx.AsyncClient(timeout=timeout) as cx:
        r = await cx.get(url)
    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=r.text)
    j = r.json()
    return norm_ok("facebook", j, {
        "name": j.get("name"),
        "link": j.get("link"),
        "about": bool(j.get("about")),
        "followers": j.get("followers_count") or j.get("fan_count"),
        "verified": j.get("verification_status") in ("blue_verified", "verified"),
    })

async def fetch_tiktok(username: str, timeout: float):
    if not TT_ACCESS_TOKEN:
        return error_json(501, "tiktok not configured (TT_ACCESS_TOKEN missing)")
    if not username:
        return error_json(400, "missing username")
    headers = {"Authorization": f"Bearer {TT_ACCESS_TOKEN}"}
    url = f"https://open.tiktokapis.com/v2/user/info?username={username}"
    async with httpx.AsyncClient(timeout=timeout, headers=headers) as cx:
        r = await cx.get(url)
    if r.status_code != 200:
        return error_json(r.status_code, f"tiktok api error: {r.text[:300]}")
    j = r.json()
    account = (j.get("data") or {}).get("user") or {}
    return norm_ok("tiktok", j, {
        "username": account.get("username") or username,
        "display_name": account.get("display_name") or account.get("nickname"),
        "followers": account.get("follower_count"),
        "videos": account.get("video_count"),
        "verified": account.get("is_verified"),
        "has_bio": bool(account.get("bio")),
    })
