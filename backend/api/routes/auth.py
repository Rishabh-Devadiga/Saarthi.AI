"""User registration, sign-in, and session endpoints."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, ConfigDict, Field

from backend.api.schemas.common import SuccessResponse
from backend.core import security
from backend.database.models import User
from backend.services.persistence_service import PersistenceService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["auth"])

SESSION_LIFETIME = timedelta(days=30)


class SignUpRequest(BaseModel):
    """Registration payload."""

    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)


class SignInRequest(BaseModel):
    """Sign-in payload."""

    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)


class UserResponse(BaseModel):
    """Public user profile."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str | None
    created_at: datetime


class AuthResponse(BaseModel):
    """Sign-up/sign-in response carrying the bearer token and profile."""

    user: UserResponse
    token: str
    expires_at: datetime


def get_persistence_service() -> PersistenceService:
    """Return the persistence service dependency for API handlers."""

    return PersistenceService()


def _now() -> datetime:
    """Return the current UTC time."""

    return datetime.now(timezone.utc)


def _auth_failed(message: str) -> HTTPException:
    """Return a 401 response that never reveals which credential was wrong."""

    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"message": message, "error_code": "invalid_credentials"},
    )


async def get_current_user(
    request: Request,
    service: PersistenceService = Depends(get_persistence_service),
) -> User:
    """Resolve the authenticated user from a bearer token.

    Ownership is always derived from this validated server-side session;
    a user id supplied by the frontend is never trusted.
    """

    authorization = request.headers.get("authorization", "")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"message": "Sign in required.", "error_code": "unauthorized"},
        )
    token_hash = security.hash_token(token.strip())

    def _load_user() -> User | None:
        auth_session = service.get_auth_session(token_hash)
        if auth_session is None or auth_session.revoked:
            return None
        expires_at = auth_session.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at <= _now():
            return None
        return service.get_user(user_id=auth_session.user_id)

    user = await run_in_threadpool(_load_user)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"message": "Session expired. Sign in again.", "error_code": "unauthorized"},
        )
    return user


def _validate_registration(name: str, email: str, password: str) -> str | None:
    """Return the first registration validation error, if any."""

    cleaned_name, cleaned_email = name.strip(), email.strip()
    return (
        security.validate_name(cleaned_name)
        or security.validate_email(cleaned_email)
        or security.validate_password(password)
    )


def _issue_session(service: PersistenceService, user: User) -> AuthResponse:
    """Create a session record and return the token plus profile."""

    token, token_hash = security.generate_token()
    expires_at = _now() + SESSION_LIFETIME
    service.prune_auth_sessions(_now())
    service.create_auth_session(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    return AuthResponse(
        user=UserResponse.model_validate(user),
        token=token,
        expires_at=expires_at,
    )


@router.post(
    "/auth/signup",
    response_model=SuccessResponse[AuthResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Sign up",
    description="Register a new learner account and start a session.",
)
async def sign_up(
    request: SignUpRequest,
    service: PersistenceService = Depends(get_persistence_service),
) -> SuccessResponse[AuthResponse]:
    """Register a user with a hashed password and return a bearer token."""

    error = _validate_registration(request.name, request.email, request.password)
    if error is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": error, "error_code": "bad_request"},
        )
    email = security.normalize_email(request.email)

    def _register() -> AuthResponse:
        existing = service.get_user(email=email)
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "message": "An account with this email already exists.",
                    "error_code": "email_taken",
                },
            )
        user = service.create_user(name=request.name.strip(), email=email)
        stored = service.set_user_password(
            user.id, security.hash_password(request.password)
        )
        if stored is None:  # pragma: no cover - defensive; user was just created
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"message": "Sign up failed.", "error_code": "signup_failed"},
            )
        return _issue_session(service, stored)

    try:
        auth = await run_in_threadpool(_register)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Sign-up persistence failure.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Sign up failed.", "error_code": "signup_failed"},
        ) from exc
    logger.info("User signed up user_id=%s.", auth.user.id)
    return SuccessResponse(message="Signed up successfully.", data=auth)


@router.post(
    "/auth/signin",
    response_model=SuccessResponse[AuthResponse],
    summary="Sign in",
    description="Authenticate with email and password and start a session.",
)
async def sign_in(
    request: SignInRequest,
    service: PersistenceService = Depends(get_persistence_service),
) -> SuccessResponse[AuthResponse]:
    """Verify credentials and return a bearer token."""

    email = security.normalize_email(request.email)

    def _authenticate() -> AuthResponse:
        user = service.get_user(email=email)
        if (
            user is None
            or not user.password_hash
            or not security.verify_password(request.password, user.password_hash)
        ):
            raise _auth_failed("Incorrect email or password.")
        return _issue_session(service, user)

    try:
        auth = await run_in_threadpool(_authenticate)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Sign-in persistence failure.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Sign in failed.", "error_code": "signin_failed"},
        ) from exc
    logger.info("User signed in user_id=%s.", auth.user.id)
    return SuccessResponse(message="Signed in successfully.", data=auth)


@router.post(
    "/auth/signout",
    response_model=SuccessResponse[dict],
    summary="Sign out",
    description="Revoke the current bearer-token session.",
)
async def sign_out(
    request: Request,
    service: PersistenceService = Depends(get_persistence_service),
) -> SuccessResponse[dict]:
    """Revoke the caller's session token."""

    authorization = request.headers.get("authorization", "")
    _, _, token = authorization.partition(" ")
    if token.strip():
        token_hash = security.hash_token(token.strip())
        await run_in_threadpool(service.revoke_auth_session, token_hash)
    return SuccessResponse(message="Signed out successfully.", data={})


@router.get(
    "/auth/me",
    response_model=SuccessResponse[UserResponse],
    summary="Get current user",
    description="Return the profile for the authenticated session.",
)
async def get_me(
    user: User = Depends(get_current_user),
) -> SuccessResponse[UserResponse]:
    """Return the authenticated user's profile."""

    return SuccessResponse(
        message="Profile retrieved successfully.",
        data=UserResponse.model_validate(user),
    )
