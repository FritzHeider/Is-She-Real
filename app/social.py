import os
from datetime import datetime, timezone

import httpx
from fastapi import HTTPException

from .normalize import norm_ok, error_json

IG_ACCESS_TOKEN = os.getenv("IG_ACCESS_TOKEN", "")
FB_ACCESS_TOKEN = os.getenv("FB_ACCESS_TOKEN", "")
TT_ACCESS_TOKEN = os.getenv("TT_ACCESS_TOKEN", "")
X_BEARER_TOKEN = os.getenv("X_BEARER_TOKEN", "") or os.getenv("TWITTER_BEARER_TOKEN", "")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

def TOKENS_STATE():
    return {
        "instagram": bool(IG_ACCESS_TOKEN),
        "facebook": bool(FB_ACCESS_TOKEN),
        "tiktok": bool(TT_ACCESS_TOKEN),
        "twitter": bool(X_BEARER_TOKEN),
        "youtube": bool(YOUTUBE_API_KEY),
    }


def _parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)
    except ValueError:
        return None

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


async def fetch_twitter(username: str | None, user_id: str | None, timeout: float):
    if not X_BEARER_TOKEN:
        return error_json(501, "twitter not configured (X_BEARER_TOKEN missing)")
    if not username and not user_id:
        return error_json(400, "missing username or user_id")

    headers = {"Authorization": f"Bearer {X_BEARER_TOKEN}"}
    params = {
        "user.fields": "created_at,description,public_metrics,verified,protected,profile_image_url",
    }
    if user_id:
        url = f"https://api.twitter.com/2/users/{user_id}"
    else:
        url = f"https://api.twitter.com/2/users/by/username/{username}"

    async with httpx.AsyncClient(timeout=timeout, headers=headers) as cx:
        r = await cx.get(url, params=params)
    if r.status_code != 200:
        return error_json(r.status_code, f"twitter api error: {r.text[:300]}")

    data = (r.json() or {}).get("data") or {}
    metrics = data.get("public_metrics") or {}
    created = _parse_datetime(data.get("created_at"))
    age_days = None
    if created:
        age_days = (datetime.now(timezone.utc) - created).days

    return norm_ok("twitter", data, {
        "id": data.get("id"),
        "username": data.get("username") or username,
        "display_name": data.get("name"),
        "followers": metrics.get("followers_count"),
        "following": metrics.get("following_count"),
        "tweets": metrics.get("tweet_count"),
        "listed": metrics.get("listed_count"),
        "verified": data.get("verified"),
        "has_bio": bool(data.get("description")),
        "has_profile_image": bool(data.get("profile_image_url")),
        "protected": data.get("protected"),
        "account_age_days": age_days,
    })


async def fetch_youtube(channel_id: str | None, handle: str | None, custom_url: str | None, timeout: float):
    if not YOUTUBE_API_KEY:
        return error_json(501, "youtube not configured (YOUTUBE_API_KEY missing)")

    params = {"part": "snippet,statistics", "key": YOUTUBE_API_KEY}
    if channel_id:
        params["id"] = channel_id
    elif handle:
        params["forHandle"] = handle.lstrip("@")
    elif custom_url:
        # Resolve custom URLs via the Search endpoint then hydrate details.
        search_params = {
            "part": "snippet",
            "type": "channel",
            "q": custom_url,
            "maxResults": 1,
            "key": YOUTUBE_API_KEY,
        }
        async with httpx.AsyncClient(timeout=timeout) as cx:
            search_resp = await cx.get("https://www.googleapis.com/youtube/v3/search", params=search_params)
        if search_resp.status_code != 200:
            return error_json(search_resp.status_code, f"youtube search error: {search_resp.text[:200]}")
        items = (search_resp.json() or {}).get("items") or []
        if not items:
            return error_json(404, "youtube channel not found")
        params["id"] = items[0]["snippet"]["channelId"]
    else:
        return error_json(400, "missing channel_id, handle, or custom_url")

    async with httpx.AsyncClient(timeout=timeout) as cx:
        resp = await cx.get("https://www.googleapis.com/youtube/v3/channels", params=params)
    if resp.status_code != 200:
        return error_json(resp.status_code, f"youtube api error: {resp.text[:200]}")

    payload = resp.json() or {}
    items = payload.get("items") or []
    if not items:
        return error_json(404, "youtube channel not found")

    item = items[0]
    snippet = item.get("snippet") or {}
    statistics = item.get("statistics") or {}
    published = _parse_datetime(snippet.get("publishedAt"))
    age_days = None
    if published:
        age_days = (datetime.now(timezone.utc) - published).days

    subscriber_count = statistics.get("subscriberCount")
    if statistics.get("hiddenSubscriberCount"):
        subscriber_count = None

    return norm_ok("youtube", item, {
        "title": snippet.get("title"),
        "handle": snippet.get("customUrl") or handle,
        "has_description": bool(snippet.get("description")),
        "has_thumbnail": bool((snippet.get("thumbnails") or {}).get("default")),
        "subscribers": subscriber_count,
        "views": statistics.get("viewCount"),
        "videos": statistics.get("videoCount"),
        "link": f"https://www.youtube.com/channel/{item.get('id')}" if item.get("id") else None,
        "account_age_days": age_days,
    })
