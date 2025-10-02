"""Heuristic scoring helpers for social profile signals.

This module centralises the logic that turns a platform-specific signal
dictionary into a comparable credibility score.  The goal is not to be a
perfect classifier, but to surface helpful diagnostics that a caller can
combine with their own business rules.

The scoring intentionally relies on transparent heuristics instead of
black-box ML models so that users can understand why a profile received a
particular score.
"""

from __future__ import annotations

from math import log10
from typing import Any, Dict, List


def _as_int(value: Any) -> int | None:
    """Best-effort conversion to ``int``.

    The social APIs occasionally return numbers as strings; this helper keeps
    the scoring code clean by handling those conversions in a single place.
    """

    if value is None:
        return None
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)):
        return int(value)
    try:
        return int(float(str(value)))
    except (TypeError, ValueError):
        return None


def _bounded(value: float, *, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def _log_scale(count: int, *, ceiling_log: float = 6.0) -> float:
    """Scale large magnitudes into [0, 1] using a logarithmic curve."""

    if count <= 0:
        return 0.0
    return _bounded(log10(count + 1) / ceiling_log)


def _profile_completeness(signals: Dict[str, Any]) -> tuple[float | None, Dict[str, bool]]:
    """Estimate profile completeness from commonly available booleans."""

    flags = {
        "has_bio": bool(signals.get("has_bio")),
        "has_website": bool(signals.get("has_website")),
        "profile_picture": bool(
            signals.get("profile_picture")
            or signals.get("has_profile_image")
            or signals.get("has_thumbnail")
        ),
        "has_description": bool(signals.get("has_description") or signals.get("about")),
        "link": bool(signals.get("link")),
    }
    present = sum(flags.values())
    total = len(flags)
    if total == 0:
        return None, flags
    return present / total, flags


def _content_count(signals: Dict[str, Any]) -> int | None:
    for key in ("media_count", "videos", "video_count", "tweets", "posts"):
        value = _as_int(signals.get(key))
        if value is not None:
            return value
    return None


def evaluate_signals(platform: str, signals: Dict[str, Any]) -> Dict[str, Any]:
    """Return a credibility score and contextual diagnostics.

    The result dictionary has the following shape::

        {
            "score": 0.78,
            "components": [
                {"name": "audience_size", "score": 0.52, "weight": 0.25, "context": {...}},
                ...
            ],
            "derived": {...},
            "flags": ["Account is brand new"],
        }
    """

    components: List[Dict[str, Any]] = []
    flags: List[str] = []
    derived: Dict[str, Any] = {}

    total_weight = 0.0
    weighted_score = 0.0

    def add_component(name: str, score: float, weight: float, context: Dict[str, Any]):
        nonlocal total_weight, weighted_score
        bounded = _bounded(score)
        components.append(
            {
                "name": name,
                "score": round(bounded, 3),
                "weight": round(weight, 3),
                "context": context,
            }
        )
        total_weight += weight
        weighted_score += bounded * weight

    # Baseline keeps the final score from being zero when we lack data.
    add_component("baseline", 0.35, 0.1, {"platform": platform})

    audience = _as_int(
        signals.get("followers")
        or signals.get("subscribers")
        or signals.get("audience")
    )
    if audience is not None:
        audience_score = _log_scale(audience)
        add_component("audience_size", audience_score, 0.25, {"audience": audience})
        derived["audience_size"] = audience
        if audience < 50:
            flags.append("Audience size is extremely small")

    following = _as_int(signals.get("following"))
    if audience is not None and following is not None and following > 0:
        ratio = audience / following
        derived["follower_following_ratio"] = round(ratio, 2)
        if ratio < 0.5:
            flags.append("Followers-to-following ratio is unusually low")
        elif ratio > 50:
            flags.append("Followers-to-following ratio is unusually high")
        if ratio < 0.5:
            ratio_score = ratio / 0.5
        elif ratio > 3:
            ratio_score = min(1.0, 3.0 / ratio)
        else:
            ratio_score = 1.0
        add_component("follower_ratio", ratio_score, 0.15, {"ratio": round(ratio, 3)})

    account_age_days = _as_int(signals.get("account_age_days"))
    if account_age_days is not None and account_age_days >= 0:
        derived["account_age_days"] = account_age_days
        age_score = _bounded(account_age_days / 3650.0)  # 10 years => full score
        add_component("account_age", age_score, 0.2, {"days": account_age_days})
        if account_age_days < 90:
            flags.append("Account is very new")

    profile_score, profile_flags = _profile_completeness(signals)
    derived["profile_fields"] = profile_flags
    if profile_score is not None:
        add_component(
            "profile_completeness",
            profile_score,
            0.15,
            {"completed_fields": sum(profile_flags.values()), "total_fields": len(profile_flags)},
        )
        if profile_score < 0.4:
            flags.append("Profile is missing important details")

    verified = signals.get("verified")
    if verified is not None:
        add_component(
            "verification",
            1.0 if bool(verified) else 0.2,
            0.15,
            {"verified": bool(verified)},
        )

    content = _content_count(signals)
    if content is not None:
        derived["content_count"] = content
        content_score = _log_scale(max(content, 0), ceiling_log=5.0)
        add_component("content_volume", content_score, 0.1, {"count": content})
        if content < 5:
            flags.append("Very little posted content")

    score = weighted_score / total_weight if total_weight else 0.0
    return {
        "score": round(score, 3),
        "components": components,
        "derived": derived,
        "flags": flags,
    }

