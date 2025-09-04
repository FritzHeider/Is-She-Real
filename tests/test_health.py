from fastapi.testclient import TestClient
from app.main import app

def test_health():
    c = TestClient(app)
    r = c.get('/health')
    assert r.status_code == 200
    j = r.json()
    assert j.get('ok') is True
    assert j.get('service') == 'isshereal-api'

def test_admin_health_shape():
    c = TestClient(app)
    r = c.get('/admin/health')
    assert r.status_code == 200
    j = r.json()
    assert 'tokens' in j and isinstance(j['tokens'], dict)
