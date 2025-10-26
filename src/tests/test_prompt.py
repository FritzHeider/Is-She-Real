from is_she_real.models import AccountEvidence
from is_she_real.prompt import build_prompt


def test_build_prompt_includes_all_fields():
    evidence = AccountEvidence(
        platform="instagram",
        handle="@test",
        display_name="Test User",
        bio="Photographer",
        followers=1234,
        following=150,
        posts="Daily stories and reels",
        external_links=["https://example.com"],
        signals=["verified badge", "consistent posting"],
    )

    prompt = build_prompt(evidence, ["identity", "engagement"])

    assert "instagram" in prompt
    assert "@test" in prompt
    assert "verified badge" in prompt
    assert "consistent posting" in prompt
    assert "identity, engagement" in prompt
