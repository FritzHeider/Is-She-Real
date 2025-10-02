from app.metrics import evaluate_signals


def test_evaluate_signals_returns_reasonable_score():
    signals = {
        "followers": 12000,
        "following": 600,
        "account_age_days": 1500,
        "has_bio": True,
        "has_website": True,
        "profile_picture": True,
        "media_count": 240,
        "verified": True,
    }

    metrics = evaluate_signals("instagram", signals)
    assert 0.0 <= metrics["score"] <= 1.0
    assert any(component["name"] == "audience_size" for component in metrics["components"])
    assert metrics["derived"]["audience_size"] == 12000


def test_evaluate_signals_flags_small_accounts():
    metrics = evaluate_signals("twitter", {"followers": 5, "following": 50})
    assert any("Audience size is extremely small" in flag for flag in metrics["flags"])
