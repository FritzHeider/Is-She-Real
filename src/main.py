"""FastAPI entrypoint exposing the account authenticity evaluator."""

from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException
from pydantic import ValidationError

from is_she_real.evaluator import AccountEvaluator
from is_she_real.models import EvaluationRequest, EvaluationResult

app = FastAPI(
    title="Is She Real API",
    description="Evaluate social media accounts for authenticity using LLM reasoning.",
    version="1.0.0",
)


def get_evaluator() -> AccountEvaluator:
    """Provide an evaluator instance for request handling."""

    try:
        return AccountEvaluator()
    except ValidationError as exc:
        missing_env = sorted(
            {
                str(item)
                for error in exc.errors()
                if error.get("type") == "missing"
                for item in error.get("loc", ())
            }
        )
        if missing_env:
            detail = (
                "Server configuration error: missing required environment variables "
                + ", ".join(missing_env)
                + "."
            )
        else:  # pragma: no cover - defensive path
            detail = "Server configuration error: invalid environment configuration."
        raise HTTPException(status_code=500, detail=detail) from exc


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
