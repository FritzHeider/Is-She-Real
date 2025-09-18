import io

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app


def _make_image_bytes():
    img = Image.new('RGB', (48, 48), color=(180, 32, 32))
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    buf.seek(0)
    return buf.getvalue()


def test_detect_image_from_file(monkeypatch):
    monkeypatch.delenv('API_KEY', raising=False)
    client = TestClient(app)
    payload = _make_image_bytes()
    response = client.post('/detect/image', files={'file': ('test.jpg', payload, 'image/jpeg')})
    assert response.status_code == 200
    data = response.json()
    assert 0.0 <= data['fake_score'] <= 1.0
    assert 0.0 <= data['mean_ela'] <= 1.0
    assert isinstance(data.get('metadata_info'), dict)
    assert isinstance(data['metadata_info'].get('suspicious_tags'), list)
    assert isinstance(data.get('ela_preview'), str)
    assert data['ela_preview'].startswith('data:image/')


def test_detect_image_requires_input(monkeypatch):
    monkeypatch.delenv('API_KEY', raising=False)
    client = TestClient(app)
    response = client.post('/detect/image')
    assert response.status_code == 400
    detail = response.json().get('detail')
    assert 'no image' in detail.lower()
