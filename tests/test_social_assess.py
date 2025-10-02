from fastapi.testclient import TestClient
from fastapi import HTTPException

from app.main import app
from app.normalize import norm_ok


client = TestClient(app)


def test_social_assess_combines_platforms(monkeypatch):
    async def fake_instagram(*_, **__):
        return norm_ok(
            "instagram",
            {"id": "123"},
            {
                "followers": 5000,
                "following": 200,
                "has_bio": True,
                "has_website": True,
                "profile_picture": True,
                "media_count": 45,
            },
        )

    async def fake_twitter(*_, **__):
        return norm_ok(
            "twitter",
            {"id": "abc"},
            {
                "followers": 8000,
                "following": 300,
                "account_age_days": 2000,
                "verified": False,
                "has_bio": True,
                "has_profile_image": True,
                "tweets": 1200,
            },
        )

    monkeypatch.setattr("app.main.fetch_instagram", fake_instagram)
    monkeypatch.setattr("app.main.fetch_twitter", fake_twitter)
    monkeypatch.setattr(
        "app.main.TOKENS_STATE",
        lambda: {"instagram": True, "twitter": True, "facebook": False, "tiktok": False, "youtube": False},
    )

    payload = {
        "instagram": {"user_id": "123"},
        "twitter": {"username": "example"},
    }

    resp = client.post("/social/assess", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["ok"] is True
    assert set(data["results"].keys()) == {"instagram", "twitter"}
    assert data["summary"]["average_score"] is not None
    assert data["summary"]["tokens"]["instagram"] is True


def test_social_assess_handles_platform_errors(monkeypatch):
    async def boom(*_, **__):
        raise HTTPException(status_code=429, detail="rate limited")

    monkeypatch.setattr("app.main.fetch_tiktok", boom)

    resp = client.post("/social/assess", json={"tiktok": {"username": "boom"}})
    assert resp.status_code == 200
    data = resp.json()
    assert data["results"]["tiktok"]["ok"] is False
    assert any("rate limited" in flag for flag in data["summary"]["flags"])
