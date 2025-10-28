"""FastAPI entrypoint exposing the account authenticity evaluator."""

from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException

from is_she_real.evaluator import AccountEvaluator
from is_she_real.models import EvaluationRequest, EvaluationResult

app = FastAPI(
    title="Is She Real API",
    description="Evaluate social media accounts for authenticity using LLM reasoning.",
    version="1.0.0",
)


def get_evaluator() -> AccountEvaluator:
    """Provide an evaluator instance for request handling."""

    return AccountEvaluator()


@app.get("/health", summary="Service health check")
async def health() -> dict[str, str]:
    """Return a simple health payload for uptime checks."""

    return {"status": "ok"}


@app.post("/evaluate", response_model=EvaluationResult, summary="Evaluate an account")
async def evaluate_account(
    request: EvaluationRequest,
    evaluator: AccountEvaluator = Depends(get_evaluator),
) -> EvaluationResult:
    """Run the evaluator on the incoming request payload."""

    try:
        return evaluator.evaluate(request)
    except ValueError as exc:  # pragma: no cover - defensive path
        raise HTTPException(status_code=400, detail=str(exc)) from exc
