# Is She Real — LLM-Powered Account Authenticity Judge

This repository contains a minimal Python toolkit that uses OpenAI's large language models to judge the genuineness of a social media account. The project replaces the previous multi-service codebase with a focused pipeline that:

* Collects lightweight metadata about an account (bio, follower counts, content samples).
* Builds a transparent prompt that explains the evidence being supplied to the language model.
* Invokes an OpenAI model to score the likelihood that the account represents a real person or organization.
* Surfaces a structured report that includes the model's reasoning and a normalized confidence score.

## Features

* **Pure Python** – no frontend or server frameworks. The toolkit can run in a CLI, a notebook, or be embedded inside another service.
* **Deterministic schema** – input and output data structures are clearly defined with Pydantic models, making it easy to validate payloads.
* **Prompt transparency** – each evaluation stores the final prompt text alongside the model response for auditing.
* **Extensible orchestration** – adapters make it straightforward to add data collection steps from different social networks before the LLM call.

## Quickstart

1. Create and activate a Python 3.12 environment.
2. Install dependencies:

```bash
pip install -e .
```

3. Export your OpenAI API key:

```bash
export OPENAI_API_KEY="sk-..."
```

4. Run the CLI to evaluate an account description:

```bash
python -m is_she_real.cli \
  --platform instagram \
  --handle "@candidsunsets" \
  --bio "Travel photographer sharing authentic stories" \
  --followers 18400 \
  --following 180 \
  --posts "Daily reels highlighting behind-the-scenes footage"
```

The command prints a JSON report containing the credibility score, raw LLM response, and extracted warnings.

## Project Layout

```
README.md
pyproject.toml
src/
  is_she_real/
    __init__.py
    config.py
    llm.py
    models.py
    prompt.py
    evaluator.py
    cli.py
  tests/
    test_prompt.py
```

## Testing

Run unit tests with:

```bash
pytest
```

## Environment Variables

* `OPENAI_API_KEY` – required for contacting the OpenAI API.
* `OPENAI_MODEL` – optional override for the default model (`gpt-4.1-mini`).
* `OPENAI_BASE_URL` – optional custom endpoint.

## License

This project is distributed under the MIT License. See `LICENSE` for details.
