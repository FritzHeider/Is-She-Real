"""Utilities for scoring social media handles with the OpenAI API."""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List

from fastapi import HTTPException
from openai import AsyncOpenAI


DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")


def get_client() -> AsyncOpenAI | None:
    """Return an AsyncOpenAI client if the API key is configured."""

    api_key = os.getenv("OPENAI_API_KEY") or ""
    if not api_key.strip():
        return None
    return AsyncOpenAI(api_key=api_key)


def _response_schema() -> Dict[str, Any]:
    """JSON schema instructing the model to return a strict payload."""

    return {
        "type": "json_schema",
        "json_schema": {
            "name": "HandleAssessment",
            "schema": {
                "type": "object",
                "properties": {
                    "platform": {
                        "type": "string",
                        "description": "Canonical name of the social media platform.",
                    },
                    "handle": {
                        "type": "string",
                        "description": "Handle or profile identifier that was investigated.",
                    },
                    "verdict": {
                        "type": "string",
                        "enum": ["likely_real", "likely_fake", "uncertain"],
                    },
                    "confidence": {
                        "type": "number",
                        "minimum": 0,
                        "maximum": 1,
                    },
                    "reasoning": {
                        "type": "string",
                        "description": "One paragraph explaining the judgement.",
                    },
                    "evidence": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "summary": {"type": "string"},
                                "url": {
                                    "type": "string",
                                    "description": "Source URL that supports the judgement.",
                                },
                            },
                            "required": ["summary"],
                            "additionalProperties": False,
                        },
                        "maxItems": 5,
                    },
                },
                "required": ["verdict", "confidence", "reasoning", "evidence"],
                "additionalProperties": False,
            },
            "strict": True,
        },
    }


def _extract_json_payload(response: Any) -> Dict[str, Any]:
    """Pull the structured JSON payload from an OpenAI response object."""

    if hasattr(response, "model_dump"):
        dumped = response.model_dump()
    else:
        dumped = response

    output: List[Dict[str, Any]] = dumped.get("output") or []
    for item in output:
        for content in item.get("content", []) or []:
            ctype = content.get("type")
            if ctype in {"json", "json_object"} and content.get("json") is not None:
                return content["json"]
            text = content.get("text")
            if ctype == "output_text" and isinstance(text, str):
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    continue

    raise ValueError("Unable to extract JSON payload from OpenAI response")


async def evaluate_social_handle(
    *,
    handle: str,
    platform: str | None = None,
    context: str | None = None,
    model: str | None = None,
) -> Dict[str, Any]:
    """Ask OpenAI to research a handle and provide a credibility verdict."""

    client = get_client()
    if client is None:
        raise HTTPException(status_code=501, detail="openai not configured (OPENAI_API_KEY missing)")

    model_name = model or DEFAULT_MODEL

    system_prompt = (
        "You verify whether social media handles represent real individuals or official entities. "
        "Research the handle using the web search tool and weigh credible evidence before deciding. "
        "Explain your judgement succinctly."
    )

    user_prompt = (
        "Handle to evaluate: {handle}\n"
        "Platform: {platform}\n"
        "Additional context: {context}"
    ).format(
        handle=handle,
        platform=platform or "unknown",
        context=context or "(none provided)",
    )

    try:
        response = await client.responses.create(
            model=model_name,
            input=[
                {
                    "role": "system",
                    "content": [{"type": "text", "text": system_prompt}],
                },
                {"role": "user", "content": [{"type": "text", "text": user_prompt}]},
            ],
            tools=[{"type": "web_search"}],
            response_format=_response_schema(),
        )
    except Exception as exc:  # pragma: no cover - network issues
        raise HTTPException(status_code=502, detail=f"openai api error: {exc}") from exc

    payload = _extract_json_payload(response)

    verdict = payload.get("verdict")
    confidence = payload.get("confidence")
    reasoning = payload.get("reasoning")
    evidence = payload.get("evidence") or []

    if not isinstance(verdict, str) or not isinstance(confidence, (int, float)):
        raise HTTPException(status_code=502, detail="openai response missing required fields")
    if not isinstance(reasoning, str):
        raise HTTPException(status_code=502, detail="openai response missing reasoning")
    if not isinstance(evidence, list):
        raise HTTPException(status_code=502, detail="openai response evidence malformed")

    return {
        "ok": True,
        "model": model_name,
        "platform": payload.get("platform") or platform,
        "handle": payload.get("handle") or handle,
        "verdict": verdict,
        "confidence": confidence,
        "reasoning": reasoning,
        "evidence": evidence,
        "raw": payload,
    }

