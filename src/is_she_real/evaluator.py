"""High-level orchestration for evaluating account authenticity."""

from __future__ import annotations

from typing import Any, Dict

from .llm import LLMClient
from .models import AccountEvidence, EvaluationRequest, EvaluationResult, LLMJudgement
from .prompt import build_prompt


class AccountEvaluator:
    """Coordinates prompt building, LLM invocation, and result parsing."""

    def __init__(self, llm_client: LLMClient | None = None) -> None:
        self.llm = llm_client or LLMClient()

    def evaluate(self, request: EvaluationRequest) -> EvaluationResult:
        """Run the account evidence through the OpenAI model."""

        prompt = build_prompt(request.account, request.requested_checks)
        raw_output = self.llm.complete(prompt)
        payload = self._parse_output(raw_output)
        judgement = LLMJudgement.model_validate(payload)
        return EvaluationResult(
            request=request,
            prompt=prompt,
            llm_output=raw_output,
            judgement=judgement,
        )

    def _parse_output(self, text: str) -> Dict[str, Any]:
        """Parse the JSON payload from the model."""

        data = self.llm.parse_json(text)
        missing = {key for key in ("score", "rationale", "warnings", "suggested_actions") if key not in data}
        if missing:
            raise ValueError(f"Model response missing required keys: {', '.join(sorted(missing))}")
        return data

    def evaluate_account(
        self,
        platform: str,
        handle: str | None = None,
        display_name: str | None = None,
        bio: str | None = None,
        followers: int | None = None,
        following: int | None = None,
        posts: str | None = None,
        external_links: list[str] | None = None,
        signals: list[str] | None = None,
        requested_checks: list[str] | None = None,
    ) -> EvaluationResult:
        """Convenience wrapper that constructs the request model."""

        evidence = AccountEvidence(
            platform=platform,
            handle=handle,
            display_name=display_name,
            bio=bio,
            followers=followers,
            following=following,
            posts=posts,
            external_links=external_links or [],
            signals=signals or [],
        )
        request = EvaluationRequest(account=evidence, requested_checks=requested_checks or [])
        return self.evaluate(request)


__all__ = ["AccountEvaluator"]
