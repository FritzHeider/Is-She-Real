"""Command line interface for evaluating accounts."""

from __future__ import annotations

import json
from typing import Optional

import typer

from .config import get_settings
from .evaluator import AccountEvaluator

app = typer.Typer(add_completion=False, help="Judge social account authenticity using OpenAI LLMs")


@app.command()
def evaluate(
    platform: str = typer.Option(..., "--platform", help="Platform identifier"),
    handle: Optional[str] = typer.Option(None, "--handle", help="Public handle or username"),
    display_name: Optional[str] = typer.Option(None, "--display-name", help="Profile display name"),
    bio: Optional[str] = typer.Option(None, "--bio", help="Profile biography text"),
    followers: Optional[int] = typer.Option(None, "--followers", help="Follower count"),
    following: Optional[int] = typer.Option(None, "--following", help="Following count"),
    posts: Optional[str] = typer.Option(None, "--posts", help="Summary of recent posts"),
    external_links: Optional[str] = typer.Option(
        None,
        "--links",
        help="Comma-separated external links",
    ),
    signal: Optional[list[str]] = typer.Option(
        None,
        "--signal",
        help="Additional bullet point signals (repeatable)",
    ),
    check: Optional[list[str]] = typer.Option(
        None,
        "--check",
        help="Requested credibility checks (repeatable)",
    ),
) -> None:
    """Evaluate a social media account from CLI parameters."""

    settings = get_settings()
    typer.echo(f"Using OpenAI model: {settings.openai_model}")
    evaluator = AccountEvaluator()
    links = [value.strip() for value in external_links.split(",") if value.strip()] if external_links else []
    result = evaluator.evaluate_account(
        platform=platform,
        handle=handle,
        display_name=display_name,
        bio=bio,
        followers=followers,
        following=following,
        posts=posts,
        external_links=links,
        signals=signal or [],
        requested_checks=check or [],
    )
    typer.echo(json.dumps(result.model_dump(mode="json"), indent=2))


if __name__ == "__main__":  # pragma: no cover
    app()
