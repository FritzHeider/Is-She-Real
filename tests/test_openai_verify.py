from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_social_verify_requires_api_key(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    resp = client.post("/social/verify", json={"handle": "example"})
    assert resp.status_code == 501
    body = resp.json()
    assert body["detail"].startswith("openai not configured")


def test_social_verify_success(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")

    class FakeResponse:
        def __init__(self, payload):
            self._payload = payload

        def model_dump(self):
            return self._payload

    class FakeClient:
        def __init__(self, payload):
            self._payload = payload
            self.called_with = None

        class _Responses:
            def __init__(self, outer):
                self._outer = outer

            async def create(self, **kwargs):
                self._outer.called_with = kwargs
                return FakeResponse(self._outer._payload)

        @property
        def responses(self):
            return self._Responses(self)

    fake_payload = {
        "output": [
            {
                "content": [
                    {
                        "type": "json",
                        "json": {
                            "verdict": "likely_real",
                            "confidence": 0.8,
                            "reasoning": "Found multiple reputable references.",
                            "evidence": [
                                {"summary": "Official site mentions the handle", "url": "https://example.com"}
                            ],
                            "platform": "instagram",
                            "handle": "realperson",
                        },
                    }
                ]
            }
        ]
    }

    fake_client = FakeClient(fake_payload)

    monkeypatch.setattr("app.openai_assess.get_client", lambda: fake_client)

    resp = client.post(
        "/social/verify",
        json={"handle": "realperson", "platform": "instagram", "context": "Celebrity"},
    )

    assert resp.status_code == 200
    data = resp.json()
    assert data["ok"] is True
    assert data["verdict"] == "likely_real"
    assert data["platform"] == "instagram"
    assert data["handle"] == "realperson"
    assert data["evidence"][0]["url"] == "https://example.com"
