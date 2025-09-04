from fastapi.testclient import TestClient
import os
from app.main import app

def test_optional_api_key_allows_when_unset(monkeypatch):
    monkeypatch.delenv('API_KEY', raising=False)
    c = TestClient(app)
    r = c.get('/dns', params={'domain':'example.com'})
    # Depending on environment, DNS might fail; we only assert status is not 401
    assert r.status_code != 401

def test_rejects_without_key_when_set(monkeypatch):
    monkeypatch.setenv('API_KEY', 'secret')
    c = TestClient(app)
    r = c.get('/dns', params={'domain':'example.com'})
    assert r.status_code == 401
