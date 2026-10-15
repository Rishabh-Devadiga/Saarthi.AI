"""SQLAlchemy ORM models for the AI Learning Agent database schema."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database.database import Base


class User(Base):
    """Application user who owns learning workflow data."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=True,
    )
    password_hash: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    learner_intents: Mapped[list[LearnerIntent]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    learning_plans: Mapped[list[LearningPlan]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    progress_records: Mapped[list[Progress]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    feedback_history: Mapped[list[FeedbackHistory]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    nudge_history: Mapped[list[NudgeHistory]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    auth_sessions: Mapped[list[AuthSession]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    roadmaps: Mapped[list[Roadmap]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class AuthSession(Base):
    """Server-side record for an opaque bearer token session."""

    __tablename__ = "auth_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    token_hash: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    revoked: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    user: Mapped[User] = relationship(back_populates="auth_sessions")


class Roadmap(Base):
    """A saved learning roadmap: the restorable aggregate of one journey.

    ``session_json`` holds the complete workflow response (intent, plan,
    progress, feedback, and nudge reports). ``resources_json`` caches the
    YouTube video metadata per topic so reopening never refetches.
    ``progress_json`` stores the learner's completion map. Quiz, mentor, and
    interview histories are stored alongside when available.
    """

    __tablename__ = "roadmaps"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    goal: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)
    guest_import_id: Mapped[str | None] = mapped_column(
        String(128),
        index=True,
        nullable=True,
    )
    session_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    resources_json: Mapped[dict[str, Any]] = mapped_column(
        JSON, default=dict, nullable=False
    )
    progress_json: Mapped[dict[str, Any]] = mapped_column(
        JSON, default=dict, nullable=False
    )
    quiz_json: Mapped[list[Any]] = mapped_column(JSON, default=list, nullable=False)
    mentor_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    interview_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped[User] = relationship(back_populates="roadmaps")


class LearnerIntent(Base):
    """Captured learner intent extracted from a user request."""

    __tablename__ = "learner_intents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    learning_goal: Mapped[str] = mapped_column(Text, nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    current_skill_level: Mapped[str] = mapped_column(String(255), nullable=False)
    available_time: Mapped[str] = mapped_column(String(255), nullable=False)
    target_deadline: Mapped[str] = mapped_column(String(255), nullable=False)
    preferred_learning_style: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped[User] = relationship(back_populates="learner_intents")


class LearningPlan(Base):
    """Generated learning plan stored as structured JSON."""

    __tablename__ = "learning_plans"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    plan_json: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped[User] = relationship(back_populates="learning_plans")


class Progress(Base):
    """Learner progress record for a topic in a learning plan."""

    __tablename__ = "progress"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    completion_percentage: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped[User] = relationship(back_populates="progress_records")


class FeedbackHistory(Base):
    """Stored feedback generated for a learner."""

    __tablename__ = "feedback_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    feedback: Mapped[str] = mapped_column(Text, nullable=False)
    strengths: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    improvements: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped[User] = relationship(back_populates="feedback_history")


class NudgeHistory(Base):
    """Stored nudge message generated for a learner."""

    __tablename__ = "nudge_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    urgency: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped[User] = relationship(back_populates="nudge_history")
