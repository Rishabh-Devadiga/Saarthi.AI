"""Authentication primitives for user accounts and API sessions.

Uses only the Python standard library: PBKDF2-HMAC-SHA256 for password
hashing and opaque random bearer tokens for sessions. Token values are never
stored; only their SHA-256 hash is persisted, so a database read alone never
reveals a usable credential.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import re
import secrets

PASSWORD_ITERATIONS = 600_000
PASSWORD_SALT_BYTES = 16
TOKEN_BYTES = 32
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def hash_password(password: str) -> str:
    """Hash a password with a random salt for storage."""

    salt = secrets.token_bytes(PASSWORD_SALT_BYTES)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    salt_b64 = base64.b64encode(salt).decode("ascii")
    digest_b64 = base64.b64encode(digest).decode("ascii")
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt_b64}${digest_b64}"


def verify_password(password: str, password_hash: str) -> bool:
    """Return whether a password matches a stored hash (constant time)."""

    try:
        algorithm, iterations_raw, salt_b64, digest_b64 = password_hash.split("$")
    except ValueError:
        return False
    if algorithm != "pbkdf2_sha256":
        return False
    try:
        iterations = int(iterations_raw)
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(digest_b64)
    except (ValueError, base64.binascii.Error):
        return False
    candidate = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, iterations
    )
    return hmac.compare_digest(candidate, expected)


def generate_token() -> tuple[str, str]:
    """Create a bearer token and return ``(token, token_hash)``.

    Only the hash is safe to persist. The token itself is shown to the
    caller exactly once.
    """

    token = secrets.token_urlsafe(TOKEN_BYTES)
    return token, hash_token(token)


def hash_token(token: str) -> str:
    """Return the SHA-256 hex digest identifying a bearer token."""

    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def normalize_email(email: str) -> str:
    """Normalize an email address for storage and lookup."""

    return email.strip().lower()


def validate_email(email: str) -> str | None:
    """Return an error message when an email address is invalid, else None."""

    if not EMAIL_PATTERN.match(email.strip()):
        return "Enter a valid email address."
    return None


def validate_password(password: str) -> str | None:
    """Return an error message when a password is too weak, else None."""

    if len(password) < 8:
        return "Password must be at least 8 characters long."
    if len(password) > 128:
        return "Password must be at most 128 characters long."
    return None


def validate_name(name: str) -> str | None:
    """Return an error message when a display name is invalid, else None."""

    if not name.strip():
        return "Enter your name."
    if len(name.strip()) > 255:
        return "Name must be at most 255 characters long."
    return None
