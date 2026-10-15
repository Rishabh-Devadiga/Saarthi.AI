"""Top-level API router that composes all endpoint modules."""

from __future__ import annotations

from fastapi import APIRouter

from backend.api.routes import (
    auth,
    calendar,
    chat,
    health,
    interview,
    learning,
    mentor,
    quiz,
    roadmaps,
    root,
)


api_router = APIRouter()
api_router.include_router(root.router)
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(chat.router)
api_router.include_router(learning.router)
api_router.include_router(calendar.router)
api_router.include_router(quiz.router)
api_router.include_router(mentor.router)
api_router.include_router(interview.router)
api_router.include_router(roadmaps.router)
