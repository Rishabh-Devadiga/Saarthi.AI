"""Reusable CRUD helpers for the database persistence layer.

This module only knows about SQLAlchemy sessions and ORM models. It does not
import or depend on CrewAI agents, orchestration services, or FastAPI routes.
"""

from __future__ import annotations

from collections.abc import Iterator, Sequence
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from backend.database.database import SessionLocal
from backend.database.models import (
    AuthSession,
    FeedbackHistory,
    LearnerIntent,
    LearningPlan,
    NudgeHistory,
    Progress,
    Roadmap,
    User,
)


class PersistenceError(RuntimeError):
    """Raised when a database operation fails inside the persistence layer."""


@contextmanager
def get_db_session() -> Iterator[Session]:
    """Yield a managed database session with commit and rollback handling.

    The session commits if the operation succeeds. Any SQLAlchemy error rolls
    back the transaction and is re-raised as ``PersistenceError`` with the
    original exception chained for debugging.
    """

    session = SessionLocal()
    try:
        yield session
        session.commit()
    except SQLAlchemyError as exc:
        session.rollback()
        raise PersistenceError(f"Database operation failed: {exc}") from exc
    finally:
        session.close()


def create_user(name: str, email: str | None = None) -> User:
    """Create and return a user."""

    with get_db_session() as session:
        user = User(name=name, email=email)
        session.add(user)
        session.flush()
        session.refresh(user)
        return user


def set_user_password(user_id: int, password_hash: str) -> User | None:
    """Store a password hash for a user, returning the user when found."""

    with get_db_session() as session:
        user = session.get(User, user_id)
        if user is None:
            return None
        user.password_hash = password_hash
        session.flush()
        session.refresh(user)
        return user


def get_user_by_id(user_id: int) -> User | None:
    """Return a user by primary key, or ``None`` when not found."""

    with get_db_session() as session:
        return session.get(User, user_id)


def get_user_by_name(name: str) -> User | None:
    """Return the first user with the given name, or ``None`` when absent."""

    with get_db_session() as session:
        statement = select(User).where(User.name == name).order_by(User.id.asc())
        return session.scalars(statement).first()


def get_user_by_email(email: str) -> User | None:
    """Return a user by email address, or ``None`` when not found."""

    with get_db_session() as session:
        statement = select(User).where(User.email == email)
        return session.scalars(statement).first()


def list_users(limit: int | None = None, offset: int = 0) -> Sequence[User]:
    """Return users ordered by creation sequence."""

    with get_db_session() as session:
        statement = select(User).order_by(User.id.asc()).offset(offset)
        if limit is not None:
            statement = statement.limit(limit)
        return session.scalars(statement).all()


def delete_user(user_id: int) -> bool:
    """Delete a user by id and return whether a row was deleted."""

    with get_db_session() as session:
        user = session.get(User, user_id)
        if user is None:
            return False

        session.delete(user)
        return True


def create_learner_intent(
    *,
    user_id: int,
    learning_goal: str,
    subject: str,
    current_skill_level: str,
    available_time: str,
    target_deadline: str,
    preferred_learning_style: str | None = None,
) -> LearnerIntent:
    """Create and return a learner intent for a user."""

    with get_db_session() as session:
        intent = LearnerIntent(
            user_id=user_id,
            learning_goal=learning_goal,
            subject=subject,
            current_skill_level=current_skill_level,
            available_time=available_time,
            target_deadline=target_deadline,
            preferred_learning_style=preferred_learning_style,
        )
        session.add(intent)
        session.flush()
        session.refresh(intent)
        return intent


def get_latest_learner_intent(user_id: int) -> LearnerIntent | None:
    """Return the most recent learner intent for a user."""

    with get_db_session() as session:
        statement = (
            select(LearnerIntent)
            .where(LearnerIntent.user_id == user_id)
            .order_by(LearnerIntent.created_at.desc(), LearnerIntent.id.desc())
        )
        return session.scalars(statement).first()


def list_learner_intents(user_id: int) -> Sequence[LearnerIntent]:
    """Return all learner intents for a user, newest first."""

    with get_db_session() as session:
        statement = (
            select(LearnerIntent)
            .where(LearnerIntent.user_id == user_id)
            .order_by(LearnerIntent.created_at.desc(), LearnerIntent.id.desc())
        )
        return session.scalars(statement).all()


def create_learning_plan(
    *,
    user_id: int,
    title: str,
    plan_json: dict[str, Any],
) -> LearningPlan:
    """Create and return a learning plan with the planner JSON preserved."""

    with get_db_session() as session:
        plan = LearningPlan(user_id=user_id, title=title, plan_json=plan_json)
        session.add(plan)
        session.flush()
        session.refresh(plan)
        return plan


def get_latest_learning_plan(user_id: int) -> LearningPlan | None:
    """Return the most recent learning plan for a user."""

    with get_db_session() as session:
        statement = (
            select(LearningPlan)
            .where(LearningPlan.user_id == user_id)
            .order_by(LearningPlan.created_at.desc(), LearningPlan.id.desc())
        )
        return session.scalars(statement).first()


def list_learning_plans(user_id: int) -> Sequence[LearningPlan]:
    """Return all learning plans for a user, newest first."""

    with get_db_session() as session:
        statement = (
            select(LearningPlan)
            .where(LearningPlan.user_id == user_id)
            .order_by(LearningPlan.created_at.desc(), LearningPlan.id.desc())
        )
        return session.scalars(statement).all()


def delete_learning_plan(plan_id: int) -> bool:
    """Delete a learning plan by id and return whether a row was deleted."""

    with get_db_session() as session:
        plan = session.get(LearningPlan, plan_id)
        if plan is None:
            return False

        session.delete(plan)
        return True


def create_progress_record(
    *,
    user_id: int,
    topic: str,
    completion_percentage: float = 0.0,
    completed: bool = False,
) -> Progress:
    """Create a progress record, updating an existing user/topic row if present."""

    existing_progress = get_progress(user_id=user_id, topic=topic)
    if existing_progress is not None:
        return update_progress(
            user_id=user_id,
            topic=topic,
            completion_percentage=completion_percentage,
            completed=completed,
        )

    with get_db_session() as session:
        progress = Progress(
            user_id=user_id,
            topic=topic,
            completion_percentage=completion_percentage,
            completed=completed,
        )
        session.add(progress)
        session.flush()
        session.refresh(progress)
        return progress


def get_progress(user_id: int, topic: str) -> Progress | None:
    """Return one progress record for a user's topic."""

    with get_db_session() as session:
        statement = select(Progress).where(
            Progress.user_id == user_id,
            Progress.topic == topic,
        )
        return session.scalars(statement).first()


def update_progress(
    *,
    user_id: int,
    topic: str,
    completion_percentage: float | None = None,
    completed: bool | None = None,
) -> Progress:
    """Update an existing progress record or create it when no row exists.

    This behaves like a user/topic upsert so repeated updates do not create
    duplicate progress rows for the same topic.
    """

    with get_db_session() as session:
        statement = select(Progress).where(
            Progress.user_id == user_id,
            Progress.topic == topic,
        )
        progress = session.scalars(statement).first()
        if progress is None:
            progress = Progress(
                user_id=user_id,
                topic=topic,
                completion_percentage=completion_percentage or 0.0,
                completed=completed if completed is not None else False,
            )
            session.add(progress)
        else:
            if completion_percentage is not None:
                progress.completion_percentage = completion_percentage
            if completed is not None:
                progress.completed = completed

        session.flush()
        session.refresh(progress)
        return progress


def list_progress(user_id: int) -> Sequence[Progress]:
    """Return all progress records for a user."""

    with get_db_session() as session:
        statement = (
            select(Progress)
            .where(Progress.user_id == user_id)
            .order_by(Progress.updated_at.desc(), Progress.id.desc())
        )
        return session.scalars(statement).all()


def create_feedback(
    *,
    user_id: int,
    feedback: str,
    strengths: list[str],
    improvements: list[str],
) -> FeedbackHistory:
    """Create and return a feedback history entry."""

    with get_db_session() as session:
        feedback_entry = FeedbackHistory(
            user_id=user_id,
            feedback=feedback,
            strengths=strengths,
            improvements=improvements,
        )
        session.add(feedback_entry)
        session.flush()
        session.refresh(feedback_entry)
        return feedback_entry


def get_feedback_history(user_id: int) -> Sequence[FeedbackHistory]:
    """Return all feedback history entries for a user, newest first."""

    with get_db_session() as session:
        statement = (
            select(FeedbackHistory)
            .where(FeedbackHistory.user_id == user_id)
            .order_by(FeedbackHistory.created_at.desc(), FeedbackHistory.id.desc())
        )
        return session.scalars(statement).all()


def get_latest_feedback(user_id: int) -> FeedbackHistory | None:
    """Return the most recent feedback history entry for a user."""

    with get_db_session() as session:
        statement = (
            select(FeedbackHistory)
            .where(FeedbackHistory.user_id == user_id)
            .order_by(FeedbackHistory.created_at.desc(), FeedbackHistory.id.desc())
        )
        return session.scalars(statement).first()


def create_nudge(
    *,
    user_id: int,
    message: str,
    urgency: str,
) -> NudgeHistory:
    """Create and return a nudge history entry."""

    with get_db_session() as session:
        nudge = NudgeHistory(user_id=user_id, message=message, urgency=urgency)
        session.add(nudge)
        session.flush()
        session.refresh(nudge)
        return nudge


def get_nudge_history(user_id: int) -> Sequence[NudgeHistory]:
    """Return all nudge history entries for a user, newest first."""

    with get_db_session() as session:
        statement = (
            select(NudgeHistory)
            .where(NudgeHistory.user_id == user_id)
            .order_by(NudgeHistory.created_at.desc(), NudgeHistory.id.desc())
        )
        return session.scalars(statement).all()


def get_latest_nudge(user_id: int) -> NudgeHistory | None:
    """Return the most recent nudge history entry for a user."""

    with get_db_session() as session:
        statement = (
            select(NudgeHistory)
            .where(NudgeHistory.user_id == user_id)
            .order_by(NudgeHistory.created_at.desc(), NudgeHistory.id.desc())
        )
        return session.scalars(statement).first()


def create_auth_session(
    *,
    user_id: int,
    token_hash: str,
    expires_at: datetime,
) -> AuthSession:
    """Persist a session record for an issued bearer token."""

    with get_db_session() as session:
        auth_session = AuthSession(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        session.add(auth_session)
        session.flush()
        session.refresh(auth_session)
        return auth_session


def get_auth_session(token_hash: str) -> AuthSession | None:
    """Return a session record by token hash, or ``None`` when absent."""

    with get_db_session() as session:
        statement = select(AuthSession).where(AuthSession.token_hash == token_hash)
        return session.scalars(statement).first()


def revoke_auth_session(token_hash: str) -> bool:
    """Mark one session revoked and return whether a row was updated."""

    with get_db_session() as session:
        statement = select(AuthSession).where(AuthSession.token_hash == token_hash)
        auth_session = session.scalars(statement).first()
        if auth_session is None:
            return False
        auth_session.revoked = True
        session.flush()
        return True


def delete_expired_auth_sessions(reference: datetime) -> int:
    """Delete expired or revoked sessions and return the removed row count."""

    with get_db_session() as session:
        statement = select(AuthSession).where(
            (AuthSession.expires_at <= reference) | (AuthSession.revoked.is_(True))
        )
        expired = session.scalars(statement).all()
        count = len(expired)
        for auth_session in expired:
            session.delete(auth_session)
        return count


def create_roadmap(
    *,
    user_id: int,
    title: str,
    goal: str | None = None,
    status: str = "active",
    guest_import_id: str | None = None,
    session_json: dict[str, Any] | None = None,
    resources_json: dict[str, Any] | None = None,
    progress_json: dict[str, Any] | None = None,
    quiz_json: list[Any] | None = None,
    mentor_json: dict[str, Any] | None = None,
    interview_json: dict[str, Any] | None = None,
) -> Roadmap:
    """Create and return a saved learning roadmap."""

    with get_db_session() as session:
        roadmap = Roadmap(
            user_id=user_id,
            title=title,
            goal=goal,
            status=status,
            guest_import_id=guest_import_id,
            session_json=session_json,
            resources_json=resources_json or {},
            progress_json=progress_json or {},
            quiz_json=quiz_json or [],
            mentor_json=mentor_json,
            interview_json=interview_json,
        )
        session.add(roadmap)
        session.flush()
        session.refresh(roadmap)
        return roadmap


def get_roadmap_by_id(roadmap_id: int) -> Roadmap | None:
    """Return a roadmap by primary key, or ``None`` when not found."""

    with get_db_session() as session:
        return session.get(Roadmap, roadmap_id)


def get_roadmap_by_import_id(user_id: int, guest_import_id: str) -> Roadmap | None:
    """Return a roadmap previously imported from a guest session, if any."""

    with get_db_session() as session:
        statement = (
            select(Roadmap)
            .where(
                Roadmap.user_id == user_id,
                Roadmap.guest_import_id == guest_import_id,
            )
            .order_by(Roadmap.id.desc())
        )
        return session.scalars(statement).first()


def list_roadmaps(user_id: int) -> Sequence[Roadmap]:
    """Return all roadmaps owned by a user, newest first."""

    with get_db_session() as session:
        statement = (
            select(Roadmap)
            .where(Roadmap.user_id == user_id)
            .order_by(Roadmap.updated_at.desc(), Roadmap.id.desc())
        )
        return session.scalars(statement).all()


def update_roadmap(
    roadmap_id: int,
    *,
    title: str | None = None,
    goal: str | None = None,
    status: str | None = None,
    session_json: dict[str, Any] | None = None,
    resources_json: dict[str, Any] | None = None,
    progress_json: dict[str, Any] | None = None,
    quiz_json: list[Any] | None = None,
    mentor_json: dict[str, Any] | None = None,
    interview_json: dict[str, Any] | None = None,
) -> Roadmap | None:
    """Update roadmap fields and return the refreshed record, if it exists."""

    with get_db_session() as session:
        roadmap = session.get(Roadmap, roadmap_id)
        if roadmap is None:
            return None
        if title is not None:
            roadmap.title = title
        if goal is not None:
            roadmap.goal = goal
        if status is not None:
            roadmap.status = status
        if session_json is not None:
            roadmap.session_json = session_json
        if resources_json is not None:
            roadmap.resources_json = resources_json
        if progress_json is not None:
            roadmap.progress_json = progress_json
        if quiz_json is not None:
            roadmap.quiz_json = quiz_json
        if mentor_json is not None:
            roadmap.mentor_json = mentor_json
        if interview_json is not None:
            roadmap.interview_json = interview_json
        roadmap.updated_at = datetime.now(timezone.utc)
        session.flush()
        session.refresh(roadmap)
        return roadmap


def delete_roadmap(roadmap_id: int) -> bool:
    """Delete a roadmap by id and return whether a row was deleted."""

    with get_db_session() as session:
        roadmap = session.get(Roadmap, roadmap_id)
        if roadmap is None:
            return False
        session.delete(roadmap)
        return True
