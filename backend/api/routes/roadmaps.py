"""Saved learning-roadmap endpoints with ownership enforcement.

Every handler derives the owner from the validated bearer-token session
(``get_current_user``). A roadmap id from the path is always checked against
that owner, so one user can never read or modify another user's roadmaps.
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Path, status
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, ConfigDict, Field

from backend.api.routes.auth import get_current_user, get_persistence_service
from backend.api.schemas.common import SuccessResponse
from backend.database.models import User
from backend.services.persistence_service import PersistenceService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["roadmaps"])


class RoadmapPayload(BaseModel):
    """Full snapshot of one learning journey."""

    title: str = Field(..., min_length=1, max_length=255)
    goal: str | None = Field(default=None, max_length=4000)
    status: str = Field(default="active", max_length=50)
    session: dict[str, Any] | None = None
    resources: dict[str, Any] | None = None
    progress: dict[str, Any] | None = None
    quiz: list[Any] | None = None
    mentor: dict[str, Any] | None = None
    interview: dict[str, Any] | None = None


class RoadmapImportPayload(RoadmapPayload):
    """Guest roadmap import carrying the guest-side identifier."""

    guest_id: str = Field(..., min_length=1, max_length=128)


class RoadmapUpdatePayload(BaseModel):
    """Partial roadmap update; only provided fields are changed."""

    title: str | None = Field(default=None, min_length=1, max_length=255)
    goal: str | None = Field(default=None, max_length=4000)
    status: str | None = Field(default=None, max_length=50)
    session: dict[str, Any] | None = None
    resources: dict[str, Any] | None = None
    progress: dict[str, Any] | None = None
    quiz: list[Any] | None = None
    mentor: dict[str, Any] | None = None
    interview: dict[str, Any] | None = None


class RoadmapSummary(BaseModel):
    """Roadmap list entry."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    goal: str | None
    status: str
    created_at: datetime
    updated_at: datetime


class RoadmapDetail(RoadmapSummary):
    """Complete roadmap including its saved snapshot."""

    session: dict[str, Any] | None = Field(default=None, alias="session_json")
    resources: dict[str, Any] = Field(default_factory=dict, alias="resources_json")
    progress: dict[str, Any] = Field(default_factory=dict, alias="progress_json")
    quiz: list[Any] = Field(default_factory=list, alias="quiz_json")
    mentor: dict[str, Any] | None = Field(default=None, alias="mentor_json")
    interview: dict[str, Any] | None = Field(default=None, alias="interview_json")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


def _not_found() -> HTTPException:
    """Return a 404 that reveals nothing about other users' roadmaps."""

    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"message": "Roadmap not found.", "error_code": "not_found"},
    )


async def _owned_roadmap(
    service: PersistenceService, roadmap_id: int, user_id: int
):
    """Return a roadmap owned by a user, raising 404 otherwise."""

    def _load():
        roadmap = service.get_roadmap(roadmap_id)
        if roadmap is None or roadmap.user_id != user_id:
            return None
        return roadmap

    roadmap = await run_in_threadpool(_load)
    if roadmap is None:
        raise _not_found()
    return roadmap


@router.get(
    "/roadmaps",
    response_model=SuccessResponse[list[RoadmapSummary]],
    summary="List my roadmaps",
    description="List roadmaps owned by the authenticated user.",
)
async def list_roadmaps(
    user: User = Depends(get_current_user),
    service: PersistenceService = Depends(get_persistence_service),
) -> SuccessResponse[list[RoadmapSummary]]:
    """Return the authenticated user's saved roadmaps."""

    roadmaps = await run_in_threadpool(service.list_roadmaps, user.id)
    return SuccessResponse(
        message="Roadmaps retrieved successfully.",
        data=[RoadmapSummary.model_validate(roadmap) for roadmap in roadmaps],
    )


@router.post(
    "/roadmaps",
    response_model=SuccessResponse[RoadmapDetail],
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
    summary="Save a roadmap",
    description="Persist a learning roadmap snapshot for the authenticated user.",
)
async def create_roadmap(
    payload: RoadmapPayload,
    user: User = Depends(get_current_user),
    service: PersistenceService = Depends(get_persistence_service),
) -> SuccessResponse[RoadmapDetail]:
    """Save a roadmap owned by the authenticated user."""

    def _create():
        return service.create_roadmap(
            user_id=user.id,
            title=payload.title.strip(),
            goal=payload.goal.strip() if payload.goal else None,
            status=payload.status,
            session_json=payload.session,
            resources_json=payload.resources,
            progress_json=payload.progress,
            quiz_json=payload.quiz,
            mentor_json=payload.mentor,
            interview_json=payload.interview,
        )

    roadmap = await run_in_threadpool(_create)
    logger.info("Roadmap saved roadmap_id=%s user_id=%s.", roadmap.id, user.id)
    return SuccessResponse(
        message="Roadmap saved successfully.",
        data=RoadmapDetail.model_validate(roadmap),
    )


@router.post(
    "/roadmaps/import",
    response_model=SuccessResponse[RoadmapDetail],
    response_model_by_alias=False,
    status_code=status.HTTP_201_CREATED,
    summary="Import a guest roadmap",
    description=(
        "Save a guest-local roadmap into the authenticated account without "
        "regenerating it. Repeated imports of the same guest roadmap return "
        "the already imported record instead of creating duplicates."
    ),
)
async def import_guest_roadmap(
    payload: RoadmapImportPayload,
    user: User = Depends(get_current_user),
    service: PersistenceService = Depends(get_persistence_service),
) -> SuccessResponse[RoadmapDetail]:
    """Import a guest roadmap once, keyed by its guest-side identifier."""

    guest_import_id = f"guest:{payload.guest_id.strip()}"

    def _import():
        existing = service.get_roadmap_by_import_id(user.id, guest_import_id)
        if existing is not None:
            return existing, False
        created = service.create_roadmap(
            user_id=user.id,
            title=payload.title.strip(),
            goal=payload.goal.strip() if payload.goal else None,
            status=payload.status,
            guest_import_id=guest_import_id,
            session_json=payload.session,
            resources_json=payload.resources,
            progress_json=payload.progress,
            quiz_json=payload.quiz,
            mentor_json=payload.mentor,
            interview_json=payload.interview,
        )
        return created, True

    roadmap, created = await run_in_threadpool(_import)
    logger.info(
        "Guest roadmap %s roadmap_id=%s user_id=%s.",
        "imported" if created else "already imported",
        roadmap.id,
        user.id,
    )
    return SuccessResponse(
        message=(
            "Guest roadmap imported successfully."
            if created
            else "Guest roadmap was already imported."
        ),
        data=RoadmapDetail.model_validate(roadmap),
    )


@router.get(
    "/roadmaps/{roadmap_id}",
    response_model=SuccessResponse[RoadmapDetail],
    response_model_by_alias=False,
    summary="Get a roadmap",
    description="Return one roadmap owned by the authenticated user.",
)
async def get_roadmap(
    roadmap_id: int = Path(..., gt=0, description="Positive roadmap id."),
    user: User = Depends(get_current_user),
    service: PersistenceService = Depends(get_persistence_service),
) -> SuccessResponse[RoadmapDetail]:
    """Return one owned roadmap with its full saved snapshot."""

    roadmap = await _owned_roadmap(service, roadmap_id, user.id)
    return SuccessResponse(
        message="Roadmap retrieved successfully.",
        data=RoadmapDetail.model_validate(roadmap),
    )


@router.patch(
    "/roadmaps/{roadmap_id}",
    response_model=SuccessResponse[RoadmapDetail],
    response_model_by_alias=False,
    summary="Update a roadmap",
    description="Update progress, resources, quiz history, or metadata.",
)
async def update_roadmap(
    payload: RoadmapUpdatePayload,
    roadmap_id: int = Path(..., gt=0, description="Positive roadmap id."),
    user: User = Depends(get_current_user),
    service: PersistenceService = Depends(get_persistence_service),
) -> SuccessResponse[RoadmapDetail]:
    """Update fields of one owned roadmap."""

    await _owned_roadmap(service, roadmap_id, user.id)

    def _update():
        fields: dict[str, Any] = {}
        if payload.title is not None:
            fields["title"] = payload.title.strip()
        if payload.goal is not None:
            fields["goal"] = payload.goal.strip() or None
        if payload.status is not None:
            fields["status"] = payload.status
        if payload.session is not None:
            fields["session_json"] = payload.session
        if payload.resources is not None:
            fields["resources_json"] = payload.resources
        if payload.progress is not None:
            fields["progress_json"] = payload.progress
        if payload.quiz is not None:
            fields["quiz_json"] = payload.quiz
        if payload.mentor is not None:
            fields["mentor_json"] = payload.mentor
        if payload.interview is not None:
            fields["interview_json"] = payload.interview
        return service.update_roadmap(roadmap_id, **fields)

    roadmap = await run_in_threadpool(_update)
    if roadmap is None:  # pragma: no cover - ownership checked above
        raise _not_found()
    return SuccessResponse(
        message="Roadmap updated successfully.",
        data=RoadmapDetail.model_validate(roadmap),
    )


@router.delete(
    "/roadmaps/{roadmap_id}",
    response_model=SuccessResponse[dict],
    summary="Delete a roadmap",
    description="Delete one roadmap owned by the authenticated user.",
)
async def delete_roadmap(
    roadmap_id: int = Path(..., gt=0, description="Positive roadmap id."),
    user: User = Depends(get_current_user),
    service: PersistenceService = Depends(get_persistence_service),
) -> SuccessResponse[dict]:
    """Delete one owned roadmap."""

    await _owned_roadmap(service, roadmap_id, user.id)

    def _delete() -> bool:
        roadmap = service.get_roadmap(roadmap_id)
        if roadmap is None or roadmap.user_id != user.id:
            return False
        return service.delete_roadmap(roadmap_id)

    deleted = await run_in_threadpool(_delete)
    if not deleted:  # pragma: no cover - ownership checked above
        raise _not_found()
    logger.info("Roadmap deleted roadmap_id=%s user_id=%s.", roadmap_id, user.id)
    return SuccessResponse(message="Roadmap deleted successfully.", data={})
