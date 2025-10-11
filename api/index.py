# api/index.py
import sys, traceback
print("Cold start: importing app", file=sys.stderr)
try:
    from app.main import app  # FastAPI instance
    print("Cold start OK", file=sys.stderr)
except Exception:
    traceback.print_exc()
    raise