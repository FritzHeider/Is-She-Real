"""Pydantic models describing evaluator inputs and outputs."""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class AccountEvidence(BaseModel):
    """Evidence describing a social media account."""

    platform: str = Field(..., description="Platform identifier, e.g. instagram, twitter")
    handle: Optional[str] = Field(None, description="Public handle or username")
    display_name: Optional[str] = Field(None, description="Profile display name")
    bio: Optional[str] = Field(None, description="Profile biography text")
    followers: Optional[int] = Field(None, ge=0, description="Follower count")
    following: Optional[int] = Field(None, ge=0, description="Following count")
    posts: Optional[str] = Field(None, description="Summary of recent posts or content themes")
    external_links: List[str] = Field(default_factory=list, description="List of URLs referenced by the profile")
    signals: List[str] = Field(default_factory=list, description="Additional bullet point signals collected upstream")


class EvaluationRequest(BaseModel):
    """Payload sent to the evaluator."""

    account: AccountEvidence
    requested_checks: List[str] = Field(
        default_factory=lambda: ["identity", "activity", "engagement"],
        description="Specific credibility dimensions to inspect",
    )


class LLMJudgement(BaseModel):
    """Structured response returned by the OpenAI model."""

    score: float = Field(..., ge=0.0, le=1.0)
    rationale: str
    warnings: List[str] = Field(default_factory=list)
    suggested_actions: List[str] = Field(default_factory=list)


class EvaluationResult(BaseModel):
    """Full result returned by the evaluator."""

    request: EvaluationRequest
    prompt: str
    llm_output: str
    judgement: LLMJudgement


__all__ = [
    "AccountEvidence",
    "EvaluationRequest",
    "LLMJudgement",
    "EvaluationResult",
]
