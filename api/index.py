"""Vercel entrypoint for the FastAPI application."""
from app.main import app as fastapi_app

# Vercel looks for a module-level ``app`` variable to serve ASGI apps.
app = fastapi_app
