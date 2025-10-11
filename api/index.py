# api/index.py
"""
Vercel entrypoint for the FastAPI app.
- Exports a module-level `app` for Vercel's Python runtime to wrap.
- No uvicorn.run here. No network calls on import. No heavy imports at module scope.
"""

import sys
import traceback

print("Cold start: importing FastAPI app from app.main", file=sys.stderr)

try:
    from app.main import app  # FastAPI instance defined in app/main.py
    print("Cold start: import OK; app is ready", file=sys.stderr)
except Exception as exc:
    print("Cold start: FAILED to import app. Traceback:", file=sys.stderr)
    traceback.print_exc()
    # Re-raise so Vercel surfaces FUNCTION_INVOCATION_FAILED with a stack trace in Function Logs
    raise