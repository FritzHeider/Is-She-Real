# app/main.py
from __future__ import annotations

import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Avoid heavy imports at module scope; lazy-import inside endpoints if needed
# (e.g., from PIL import Image) to keep cold starts stable.

APP_VERSION = os.getenv("ISR_VERSION", "0.1.0")

app = FastAPI(
    title="Is-She-Real API",
    version=APP_VERSION,
    docs_url="/api/docs",   # keeps swagger under /api when proxied by vercel
    redoc_url=None
)

class Ping(BaseModel):
    message: str = "pong"

@app.get("/api/health")
def health() -> dict:
    """
    Zero-dependency liveness probe.
    If this 200s on Vercel, your handler + deps are good.
    """
    return {"ok": True, "version": APP_VERSION}

@app.get("/api/ping", response_model=Ping)
def ping() -> Ping:
    return Ping()

@app.post("/api/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Example endpoint scaffold. Does not import heavy libs at module import time.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Provide an image file.")

    # Lazy import to keep cold start fast and avoid native lib pitfalls in serverless
    try:
        from PIL import Image
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pillow not available: {e}")

    try:
        import io
        data = await file.read()
        img = Image.open(io.BytesIO(data))
        width, height = img.size
        # Do your lightweight checks here; heavy models should be called via a separate service.
        result = {
            "filename": file.filename,
            "content_type": file.content_type,
            "width": width,
            "height": height,
            "format": img.format,
            "mode": img.mode
        }
        return JSONResponse(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {e}")