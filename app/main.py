from fastapi import FastAPI
import os

app = FastAPI(title="Is-She-Real", version=os.getenv("ISR_VERSION","0.1.0"))

@app.get("/api/health")
def health():
    return {"ok": True}