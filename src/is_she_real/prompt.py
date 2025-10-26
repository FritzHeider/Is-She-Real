"""Prompt assembly for the OpenAI evaluation call."""

from __future__ import annotations

from textwrap import dedent
from typing import Iterable

from .models import AccountEvidence


def format_signals(signals: Iterable[str]) -> str:
    """Return bullet list text for additional signals."""

    items = list(signals)
    if not items:
        return "  - (no additional signals provided)"
    return "\n".join(f"  - {item}" for item in items)


def build_prompt(evidence: AccountEvidence, requested_checks: Iterable[str]) -> str:
    """Build the system prompt delivered to the LLM."""

    sections = [
        "You are an analyst that determines whether a social media profile is likely managed by a real person or organization.",
        "Use the provided evidence only. Do not assume access to private data.",
        "Return a JSON object with keys: score (0-1 float), rationale (short paragraph), warnings (array of strings), suggested_actions (array of strings).",
        "If information is missing, explain how it limits confidence.",
        "Requested checks: " + ", ".join(requested_checks) if requested_checks else "Requested checks: general credibility",
        """Evidence:\n  Platform: {platform}\n  Handle: {handle}\n  Display Name: {display_name}\n  Bio: {bio}\n  Followers: {followers}\n  Following: {following}\n  Content Summary: {posts}\n  External Links:\n{links}\n  Additional Signals:\n{signals}\n""".format(
            platform=evidence.platform,
            handle=evidence.handle or "(unknown)",
            display_name=evidence.display_name or "(unknown)",
            bio=evidence.bio or "(none provided)",
            followers=evidence.followers if evidence.followers is not None else "(unknown)",
            following=evidence.following if evidence.following is not None else "(unknown)",
            posts=evidence.posts or "(no content summary)",
            links="\n".join(f"    - {url}" for url in evidence.external_links) or "    - (no links)",
            signals=format_signals(evidence.signals),
        ),
        "Respond with valid JSON only. No extra commentary.",
    ]

    return dedent("\n\n".join(sections)).strip()


__all__ = ["build_prompt", "format_signals"]
