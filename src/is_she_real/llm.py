"""Wrapper around the OpenAI client."""

from __future__ import annotations

import json
from typing import Any, Dict

from openai import OpenAI

from .config import Settings, get_settings


class LLMClient:
    """Thin wrapper for calling the OpenAI responses API."""

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        client_kwargs: Dict[str, Any] = {"api_key": self.settings.openai_api_key}
        if self.settings.openai_base_url:
            client_kwargs["base_url"] = self.settings.openai_base_url
        self._client = OpenAI(**client_kwargs)

    def complete(self, prompt: str) -> str:
        """Invoke the responses API and return the raw text."""

        response = self._client.responses.create(
            model=self.settings.openai_model,
            input=[{"role": "user", "content": prompt}],
            temperature=self.settings.temperature,
            max_output_tokens=self.settings.max_output_tokens,
            response_format={"type": "text"},
        )
        if not response.output:
            raise RuntimeError("OpenAI response did not contain any output blocks")
        text_blocks = [block.content[0].text for block in response.output if block.type == "message"]
        if not text_blocks:
            raise RuntimeError("OpenAI response missing text content")
        return "\n".join(text_blocks)

    @staticmethod
    def parse_json(text: str) -> Dict[str, Any]:
        """Parse the JSON emitted by the model."""

        try:
            return json.loads(text)
        except json.JSONDecodeError as exc:
            raise ValueError("Model returned invalid JSON") from exc


__all__ = ["LLMClient"]
