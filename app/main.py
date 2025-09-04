from fastapi import FastAPI

app = FastAPI(title="isshereal-api", version="0.3.0")

@app.get("/health")
async def health():
    return {"ok": True, "service": "isshereal-api", "version": "0.3.0"}
