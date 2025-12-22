"""Tests for evaluator orchestration helpers."""

from __future__ import annotations

import json

from is_she_real.evaluator import AccountEvaluator


class _FakeLLMClient:
    def __init__(self) -> None:
        self.prompts: list[str] = []

    def complete(self, prompt: str) -> str:  # type: ignore[override]
        self.prompts.append(prompt)
        return '{"score": 0.7, "rationale": "ok", "warnings": [], "suggested_actions": []}'

    @staticmethod
    def parse_json(text: str):  # type: ignore[override]
        return json.loads(text)


def test_evaluate_account_preserves_default_requested_checks() -> None:
    """When checks are not supplied, the default request checks should be used."""

    evaluator = AccountEvaluator(llm_client=_FakeLLMClient())

    result = evaluator.evaluate_account(platform="instagram", handle="@example")

    assert result.request.requested_checks == ["identity", "activity", "engagement"]
    assert "identity, activity, engagement" in result.prompt
