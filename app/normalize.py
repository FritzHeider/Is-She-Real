from typing import Any, Dict

from .metrics import evaluate_signals


def norm_ok(platform: str, raw: Dict[str, Any], signals: Dict[str, Any]) -> Dict[str, Any]:
    metrics = evaluate_signals(platform, signals)
    return {
        "ok": True,
        "platform": platform,
        "signals": signals,
        "metrics": metrics,
        "raw": raw,
    }

def error_json(status: int, message: str) -> Dict[str, Any]:
    return {"ok": False, "status": status, "error": message}
