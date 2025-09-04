# issHereal API (FastAPI)

## Local
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8080
```

## Deploy
```bash
chmod +x deploy.sh
./deploy.sh
```
