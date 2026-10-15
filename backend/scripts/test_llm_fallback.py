"""Offline wiring tests for the Gemini/Groq fallback composite.

Verifies that GeminiWithGroqFallbackLLM resolves its provider attributes
correctly and routes to Groq only after Gemini fails. No network calls.
Run with:

    python -m backend.scripts.test_llm_fallback
"""

from __future__ import annotations

import sys

from backend.core.api_key_rotation import ApiKey
from backend.core.llm import (
    GeminiWithGroqFallbackLLM,
    RotatingGeminiLLM,
    RotatingGroqLLM,
    _GeminiCircuitOpen,
    _gemini_circuit_open,
    is_retryable_gemini_error,
)
from backend.utils.console import configure_utf8_output


configure_utf8_output(sys.stdout, sys.stderr)

PASS_COUNT = 0


def check(name: str, condition: bool) -> None:
    """Record an expectation, raising on failure."""

    global PASS_COUNT
    if not condition:
        raise AssertionError(f"FAILED: {name}")
    PASS_COUNT += 1
    print(f"PASS: {name}")


class StubResult:
    """Minimal stand-in for a structured agent result."""

    def __init__(self, text: str) -> None:
        self.text = text


def _keys(*slots: int) -> list[ApiKey]:
    """Build fake key slots without touching real credentials."""

    return [ApiKey(slot=slot, value=f"TEST-KEY-{slot}") for slot in slots]


def main() -> int:
    """Run the fallback wiring checks."""

    gemini = RotatingGeminiLLM(api_keys=_keys(1, 2), model="gemini/gemini-3.5-flash")
    groq = RotatingGroqLLM(
        api_keys=_keys(1),
        model="test-model",
        provider="hosted_vllm",
        base_url="https://example.invalid/v1",
    )
    composite = GeminiWithGroqFallbackLLM(gemini=gemini, groq=groq)

    # The composite must expose the same attribute names its call() uses.
    check("composite exposes _groq", composite._groq is groq)
    check("composite exposes _gemini", composite._gemini is gemini)

    # Gemini failure routes to the Groq client without AttributeError.
    groq._clients[groq._key_pool.keys[0].value] = _StubGroqClient()
    original_gemini_call = RotatingGeminiLLM.call

    def _dead_gemini(self, messages, **kwargs):
        raise RuntimeError("simulated Gemini outage")

    RotatingGeminiLLM.call = _dead_gemini
    try:
        result = composite.call([{"role": "user", "content": "hello"}])
    finally:
        RotatingGeminiLLM.call = original_gemini_call
    check("fallback reaches Groq", isinstance(result, StubResult))
    check("fallback returns Groq output", result.text == "via-groq-stub")

    # Without Groq configured, the original Gemini error propagates unchanged.
    bare = GeminiWithGroqFallbackLLM(gemini=gemini, grok=None)
    RotatingGeminiLLM.call = _dead_gemini
    try:
        bare.call([{"role": "user", "content": "hello"}])
        raise AssertionError("FAILED: expected the Gemini error to propagate")
    except RuntimeError as exc:
        check("no-groq preserves error", str(exc) == "simulated Gemini outage")
    finally:
        RotatingGeminiLLM.call = original_gemini_call

    # The circuit-breaker sentinel never looks retryable.
    check(
        "circuit error is not retryable",
        not is_retryable_gemini_error(_GeminiCircuitOpen()),
    )
    check("circuit starts closed", not _gemini_circuit_open())

    print(f"All {PASS_COUNT} LLM fallback wiring checks passed.")
    return 0


class _StubGroqClient:
    """Fake per-key client returning canned output without network."""

    def call(self, messages, **kwargs):
        return StubResult("via-groq-stub")


if __name__ == "__main__":
    raise SystemExit(main())
