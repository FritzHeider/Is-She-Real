from typing import Any, Dict

def norm_ok(platform: str, raw: Dict[str, Any], signals: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "ok": True,
        "platform": platform,
        "signals": signals,
        "raw": raw,
    }

def error_json(status: int, message: str) -> Dict[str, Any]:
    return {"ok": False, "status": status, "error": message}
