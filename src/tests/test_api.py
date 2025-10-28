"""Integration tests for the FastAPI entrypoint."""

from __future__ import annotations

from fastapi.testclient import TestClient

from is_she_real.models import AccountEvidence, EvaluationRequest, EvaluationResult, LLMJudgement

from main import app, get_evaluator


def test_health_endpoint_returns_ok() -> None:
    """Ensure the health endpoint returns a 200 payload."""

    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_evaluate_endpoint_uses_evaluator(monkeypatch) -> None:
    """The evaluate endpoint should delegate to the evaluator and return its payload."""

    fake_request = EvaluationRequest(
        account=AccountEvidence(platform="instagram", handle="@candidsunsets"),
        requested_checks=["identity", "activity"],
    )
    fake_result = EvaluationResult(
        request=fake_request,
        prompt="Prompt text",
        llm_output='{ "score": 0.9 }',
        judgement=LLMJudgement(
            score=0.9,
            rationale="Looks authentic.",
            warnings=["High engagement spikes"],
            suggested_actions=["Continue monitoring"],
        ),
    )

    class _FakeEvaluator:
        def evaluate(self, request):  # type: ignore[override]
            assert request == fake_request
            return fake_result

    app.dependency_overrides[get_evaluator] = lambda: _FakeEvaluator()
    client = TestClient(app)

    response = client.post("/evaluate", json=fake_request.model_dump(mode="json"))
    assert response.status_code == 200
    assert response.json()["judgement"]["score"] == fake_result.judgement.score
    assert response.json()["prompt"] == fake_result.prompt
    app.dependency_overrides.clear()
