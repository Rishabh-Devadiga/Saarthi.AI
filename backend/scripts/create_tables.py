"""Create database tables for the AI Learning Agent ORM schema.

Run this script after setting DATABASE_URL in the project root .env file:

    python -m backend.scripts.create_tables

The operation is idempotent and safe to run against an existing production
database (for example on every Render deploy): ``create_all`` only creates
tables that are still missing, and the ``users.password_hash`` column patch
uses ``ADD COLUMN IF NOT EXISTS`` on PostgreSQL. Nothing is ever dropped or
altered destructively, so existing user data is never at risk.

The function is also importable as ``ensure_schema()`` so the application can
self-heal its schema on startup (see ``backend/main.py``).
"""

from __future__ import annotations

import sys
from typing import Set

from backend.utils.console import configure_utf8_output

configure_utf8_output(sys.stdout, sys.stderr)


def ensure_schema() -> int:
    """Create all missing tables and apply idempotent column patches.

    Safe to run against an existing production database: only additive
    changes are applied, nothing is dropped or altered destructively.
    Returns 0 on success, 1 on failure.
    """

    try:
        from backend.database.database import Base, engine
        from backend.database.models import (  # noqa: F401
            AuthSession,
            FeedbackHistory,
            LearnerIntent,
            LearningPlan,
            NudgeHistory,
            Progress,
            Roadmap,
            User,
        )
    except RuntimeError as exc:
        print("Database configuration is incomplete.")
        print(f"Details: {exc}")
        return 1
    except Exception as exc:
        print("Database table setup failed.")
        print("Check DATABASE_URL and installed database dependencies.")
        print(f"Details: {exc}")
        return 1

    try:
        Base.metadata.create_all(bind=engine)
        _ensure_user_password_column(engine)
    except Exception as exc:
        print("Database table creation failed.")
        print("Check PostgreSQL availability, permissions, and DATABASE_URL.")
        print(f"Details: {exc}")
        return 1

    print("Database tables created successfully.")
    return 0


def _ensure_user_password_column(engine) -> None:
    """Add users.password_hash on databases created before auth existed.

    ``create_all`` never alters existing tables, so deployments with an
    older schema need this idempotent column migration.
    """

    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns("users")}
    if "password_hash" in columns:
        return
    statement = (
        "ALTER TABLE users ADD COLUMN password_hash TEXT"
        if engine.dialect.name == "sqlite"
        else "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT"
    )
    with engine.begin() as connection:
        connection.execute(text(statement))
    print("Added users.password_hash column for authentication.")


def verify_schema() -> Set[str]:
    """Return the set of application table names present in the database.

    Useful for post-migration verification and health checks. Returns an
    empty set when the database cannot be reached or no tables exist.
    """

    from sqlalchemy import inspect

    try:
        from backend.database.database import engine

        inspector = inspect(engine)
        return set(inspector.get_table_names())
    except Exception:
        return set()


def main() -> int:
    """CLI entry point: create all missing tables idempotently."""

    return ensure_schema()


if __name__ == "__main__":
    raise SystemExit(main())
