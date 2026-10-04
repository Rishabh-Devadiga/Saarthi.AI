"""SQLAlchemy database connection setup.

This module owns only the database connection primitives:

- ``engine`` for database connectivity.
- ``SessionLocal`` for creating unit-of-work sessions.
- ``Base`` for future SQLAlchemy ORM models to inherit from.

No tables, models, or CRUD operations are defined here.
"""

from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from backend.core.config import get_settings


def _get_database_url() -> str:
    """Return the configured database URL or raise a clear setup error."""

    database_url = get_settings().database_url
    if database_url is None:
        raise RuntimeError(
            "DATABASE_URL is required. Add it to your .env file or environment."
        )
    return _normalize_database_url(database_url)


def _normalize_database_url(database_url: str) -> str:
    """Normalize the database URL to the psycopg2 dialect SQLAlchemy uses.

    Render supplies Postgres URLs as ``postgres://...``, which SQLAlchemy 2.x
    does not accept, and a ``postgresql+psycopg://`` URL would require the
    psycopg v3 driver, which this project does not install. Both cases are
    mapped to plain ``postgresql://`` so the bundled psycopg2 driver is used.
    Explicitly chosen third-party dialects (e.g. ``+asyncpg``) are left alone.
    """

    normalized_url = database_url.strip()
    if normalized_url.startswith("postgres://"):
        normalized_url = "postgresql://" + normalized_url[len("postgres://") :]
    if normalized_url.startswith("postgresql+psycopg://"):
        normalized_url = "postgresql://" + normalized_url[
            len("postgresql+psycopg://") :
        ]
    return normalized_url


def _create_engine(database_url: str) -> Engine:
    """Create the SQLAlchemy engine with production-friendly defaults."""

    return create_engine(
        database_url,
        pool_pre_ping=True,
    )


class Base(DeclarativeBase):
    """Declarative base class for future SQLAlchemy ORM models."""


engine: Engine = _create_engine(_get_database_url())
SessionLocal: sessionmaker[Session] = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)
