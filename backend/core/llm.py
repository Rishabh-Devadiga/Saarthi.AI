"""Centralized LLM configuration for CrewAI agents."""

from __future__ import annotations

import logging
from functools import lru_cache
from typing import Any

from crewai import LLM
from crewai.llms.base_llm import BaseLLM
from pydantic import PrivateAttr

from backend.core.api_key_rotation import (
    ApiKey,
    StickyApiKeyPool,
    load_api_keys,
    load_groq_keys,
)
from backend.core.config import get_settings


logger = logging.getLogger(__name__)

GEMINI_FLASH_MODEL = "gemini/gemini-3.5-flash"
RETRYABLE_GEMINI_MARKERS = (
    "resource_exhausted",
    "resource exhausted",
    "quota exceeded",
    "quota_exceeded",
    "rate limit",
    "rate_limit",
    "too many requests",
    "service unavailable",
    "internal server error",
    "bad gateway",
    "gateway timeout",
)


def is_retryable_gemini_error(exc: Exception) -> bool:
    """Return whether a Gemini failure may succeed with another API key."""

    status_code = getattr(exc, "status_code", None)
    if status_code == 429 or (
        isinstance(status_code, int) and 500 <= status_code < 600
    ):
        return True

    code = getattr(exc, "code", None)
    if code == 429 or (isinstance(code, int) and 500 <= code < 600):
        return True

    error_text = f"{type(exc).__name__}: {exc}".lower()
    if any(marker in error_text for marker in RETRYABLE_GEMINI_MARKERS):
        return True
    return any(
        status in error_text
        for status in ("429", "500", "502", "503", "504")
    )


class RotatingGeminiLLM(BaseLLM):
    """CrewAI-compatible Gemini LLM with sticky API-key fallback."""

    llm_type: str = "rotating_gemini"
    _key_pool: StickyApiKeyPool = PrivateAttr()
    _clients: dict[str, LLM] = PrivateAttr(default_factory=dict)
    _client_options: dict[str, Any] = PrivateAttr(default_factory=dict)

    def __init__(self, api_keys: list[ApiKey], **options: Any) -> None:
        super().__init__(api_key=api_keys[0].value, **options)
        self._key_pool = StickyApiKeyPool("Gemini", api_keys)
        self._client_options = options

    def call(
        self,
        messages,
        tools=None,
        callbacks=None,
        available_functions=None,
        from_task=None,
        from_agent=None,
        response_model=None,
    ):
        """Call Gemini, rotating only for quota, rate-limit, or server errors."""

        def call_with_key(api_key: str):
            client = self._clients.get(api_key)
            if client is None:
                client = LLM(api_key=api_key, **self._client_options)
                self._clients[api_key] = client
            return client.call(
                messages,
                tools=tools,
                callbacks=callbacks,
                available_functions=available_functions,
                from_task=from_task,
                from_agent=from_agent,
                response_model=response_model,
            )

        return self._key_pool.execute(
            call_with_key,
            is_retryable=is_retryable_gemini_error,
        )


RETRYABLE_GROQ_MARKERS = (
    "rate limit",
    "rate_limit",
    "too many requests",
    "service unavailable",
    "internal server error",
    "bad gateway",
    "gateway timeout",
    "timeout",
    "timed out",
    "connection error",
    "overloaded",
    "temporarily unavailable",
    # Authentication failures are key-specific: a rejected key must not pin
    # the pool when another slot may hold a valid key.
    "incorrect api key",
    "invalid api key",
    "invalid_api_key",
    "unauthorized",
    "authentication failed",
    "authentication error",
)


def is_retryable_groq_error(exc: Exception) -> bool:
    """Return whether a Groq failure may succeed with another API key."""

    status_code = getattr(exc, "status_code", None)
    if status_code == 429 or (
        isinstance(status_code, int) and 500 <= status_code < 600
    ):
        return True
    if status_code in (401, 403):
        return True

    code = getattr(exc, "code", None)
    if code == 429 or (isinstance(code, int) and 500 <= code < 600):
        return True

    error_text = f"{type(exc).__name__}: {exc}".lower()
    if any(marker in error_text for marker in RETRYABLE_GROQ_MARKERS):
        return True
    return any(
        status in error_text
        for status in ("429", "500", "502", "503", "504")
    )


class RotatingGroqLLM(BaseLLM):
    """CrewAI-compatible Groq LLM with sticky API-key fallback.

    Uses Groq Cloud's OpenAI-compatible endpoint through CrewAI's custom
    OpenAI provider, so structured (Pydantic) outputs work the same way
    as Gemini.
    """

    llm_type: str = "rotating_groq"
    _key_pool: StickyApiKeyPool = PrivateAttr()
    _clients: dict[str, LLM] = PrivateAttr(default_factory=dict)
    _client_options: dict[str, Any] = PrivateAttr(default_factory=dict)

    def __init__(self, api_keys: list[ApiKey], **options: Any) -> None:
        super().__init__(api_key=api_keys[0].value, **options)
        self._key_pool = StickyApiKeyPool("Groq", api_keys)
        self._client_options = options

    def call(
        self,
        messages,
        tools=None,
        callbacks=None,
        available_functions=None,
        from_task=None,
        from_agent=None,
        response_model=None,
    ):
        """Call Groq, rotating only for rate-limit or server errors."""

        def call_with_key(api_key: str):
            client = self._clients.get(api_key)
            if client is None:
                client = LLM(api_key=api_key, **self._client_options)
                self._clients[api_key] = client
            return client.call(
                messages,
                tools=tools,
                callbacks=callbacks,
                available_functions=available_functions,
                from_task=from_task,
                from_agent=from_agent,
                response_model=response_model,
            )

        return self._key_pool.execute(
            call_with_key,
            is_retryable=is_retryable_groq_error,
        )


class GeminiWithGroqFallbackLLM(BaseLLM):
    """Try the full Gemini key chain first, then fall back to Groq.

    The Gemini rotation behavior is unchanged; Groq is only invoked after
    the Gemini chain is exhausted, and Groq rotates through its own keys.
    """

    llm_type: str = "gemini_with_groq_fallback"
    _gemini: RotatingGeminiLLM = PrivateAttr()
    _groq: RotatingGroqLLM | None = PrivateAttr(default=None)

    def __init__(
        self,
        gemini: RotatingGeminiLLM,
        groq: RotatingGroqLLM | None = None,
        **options: Any,
    ) -> None:
        super().__init__(
            api_key=gemini._key_pool.keys[0].value,
            model=GEMINI_FLASH_MODEL,
            **options,
        )
        self._gemini = gemini
        self._groq = groq

    def call(
        self,
        messages,
        tools=None,
        callbacks=None,
        available_functions=None,
        from_task=None,
        from_agent=None,
        response_model=None,
    ):
        """Call Gemini, falling back to Groq only when Gemini is exhausted."""

        call_kwargs = {
            "tools": tools,
            "callbacks": callbacks,
            "available_functions": available_functions,
            "from_task": from_task,
            "from_agent": from_agent,
            "response_model": response_model,
        }
        try:
            return self._gemini.call(messages, **call_kwargs)
        except Exception as gemini_error:
            if self._groq is None:
                raise
            logger.warning(
                "Gemini chain exhausted (%s); falling back to Groq.",
                type(gemini_error).__name__,
            )
            try:
                return self._groq.call(messages, **call_kwargs)
            except Exception as groq_error:
                raise groq_error from gemini_error


@lru_cache
def get_gemini_llm() -> BaseLLM:
    """Return the shared LLM instance used by CrewAI agents.

    Gemini remains the primary provider with its existing key rotation;
    Groq is only used after the Gemini chain is exhausted.
    """

    settings = get_settings()
    api_keys = load_api_keys(
        "GEMINI_API_KEY",
        legacy_name="GEMINI_API_KEY",
    )
    if not settings.gemini_api_key or not api_keys:
        raise RuntimeError(
            "At least one Gemini API key is required when MOCK_MODE is false."
        )

    gemini = RotatingGeminiLLM(
        api_keys=api_keys,
        model=GEMINI_FLASH_MODEL,
        temperature=0.2,
        timeout=120,
        max_tokens=4096,
        max_output_tokens=4096,
    )

    groq_keys = load_groq_keys()
    groq = None
    if groq_keys:
        # provider="hosted_vllm" selects CrewAI's OpenAI-compatible path,
        # which (unlike custom_openai) preserves Groq's full model id such
        # as "openai/gpt-oss-120b".
        groq = RotatingGroqLLM(
            api_keys=groq_keys,
            model=settings.groq_model,
            provider="hosted_vllm",
            base_url=settings.groq_base_url,
            temperature=0.2,
            timeout=120,
            max_tokens=4096,
        )

    return GeminiWithGroqFallbackLLM(gemini=gemini, groq=groq)
