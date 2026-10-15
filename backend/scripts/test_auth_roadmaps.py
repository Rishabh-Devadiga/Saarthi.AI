"""End-to-end tests for authentication and roadmap persistence.

Runs against a temporary SQLite database with mocked external services:
no Gemini, YouTube, or network calls are made. Run with:

    python -m backend.scripts.test_auth_roadmaps
"""

from __future__ import annotations

import os
import sys
import tempfile

TEMP_DB = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
TEMP_DB.close()
os.environ["DATABASE_URL"] = f"sqlite:///{TEMP_DB.name}"
os.environ["MOCK_MODE"] = "true"

from fastapi.testclient import TestClient  # noqa: E402

from backend.main import app  # noqa: E402
from backend.scripts.create_tables import main as create_tables_main  # noqa: E402
from backend.utils.console import configure_utf8_output  # noqa: E402

configure_utf8_output(sys.stdout, sys.stderr)

PASS_COUNT = 0


def check(name: str, condition: bool, detail: str = "") -> None:
    """Record a test expectation, raising on failure."""

    global PASS_COUNT
    if not condition:
        raise AssertionError(f"FAILED: {name} {detail}".strip())
    PASS_COUNT += 1
    print(f"PASS: {name}")


def sample_session() -> dict:
    """Return a representative saved workflow snapshot."""

    return {
        "learner_intent": {"learning_goal": "Learn Python", "subject": "Python"},
        "learning_plan": {"learning_goal": "Learn Python", "subject": "Python"},
        "progress_report": {"overall_completion_percentage": 10},
        "feedback_report": None,
        "nudge_report": None,
        "workflow_completed": True,
        "current_stage": "completed",
        "error_message": None,
    }


def sample_resources() -> dict:
    """Return representative cached YouTube metadata."""

    return {
        "python basics": [
            {
                "title": "Python for Beginners",
                "channel": "Example Channel",
                "thumbnailUrl": "https://example.com/thumb.jpg",
                "videoUrl": "https://www.youtube.com/watch?v=example1",
                "durationSeconds": 600,
            }
        ]
    }


def main() -> int:
    """Run the auth and roadmap test suite."""

    if create_tables_main() != 0:
        print("FAILED: database setup")
        return 1

    client = TestClient(app, raise_server_exceptions=False)

    # 1. Sign up, sign in, sign out.
    signup = client.post(
        "/auth/signup",
        json={"name": "Test Learner", "email": "test@example.com", "password": "secret123"},
    )
    check("signup returns 201", signup.status_code == 201, signup.text[:200])
    token = signup.json()["data"]["token"]
    user_id = signup.json()["data"]["user"]["id"]
    check("signup response has no password", "secret123" not in signup.text)
    check("signup response has no hash", "password_hash" not in signup.text)

    duplicate = client.post(
        "/auth/signup",
        json={"name": "Other", "email": "test@example.com", "password": "secret123"},
    )
    check("duplicate email returns 409", duplicate.status_code == 409)

    bad_email = client.post(
        "/auth/signup",
        json={"name": "Bad", "email": "not-an-email", "password": "secret123"},
    )
    check("invalid email returns 400", bad_email.status_code == 400)

    short_password = client.post(
        "/auth/signup",
        json={"name": "Short", "email": "short@example.com", "password": "abc"},
    )
    check(
        "short password is rejected",
        short_password.status_code in (400, 422),
        str(short_password.status_code),
    )

    signin = client.post(
        "/auth/signin",
        json={"email": "test@example.com", "password": "secret123"},
    )
    check("signin returns 200", signin.status_code == 200, signin.text[:200])
    token = signin.json()["data"]["token"]

    wrong_password = client.post(
        "/auth/signin",
        json={"email": "test@example.com", "password": "wrongpass1"},
    )
    check("wrong password returns 401", wrong_password.status_code == 401)
    check(
        "wrong password hides which field failed",
        "Incorrect email or password" in wrong_password.text,
    )

    headers = {"Authorization": f"Bearer {token}"}
    me = client.get("/auth/me", headers=headers)
    check("me returns profile", me.status_code == 200 and me.json()["data"]["id"] == user_id)

    no_token = client.get("/auth/me")
    check("me without token returns 401", no_token.status_code == 401)
    bad_token = client.get("/auth/me", headers={"Authorization": "Bearer invalid"})
    check("me with bad token returns 401", bad_token.status_code == 401)

    # 2-4. Authenticated user saves, lists, and reopens a roadmap.
    payload = {
        "title": "Learn Python",
        "goal": "Learn Python from scratch",
        "session": sample_session(),
        "resources": sample_resources(),
        "progress": {"completedTopics": {"1:python basics": True}},
        "quiz": [],
    }
    created = client.post("/roadmaps", json=payload, headers=headers)
    check("roadmap create returns 201", created.status_code == 201, created.text[:300])
    roadmap_id = created.json()["data"]["id"]
    check(
        "saved resources round-trip",
        created.json()["data"]["resources"] == sample_resources(),
    )

    listed = client.get("/roadmaps", headers=headers)
    check("roadmap appears in list", any(r["id"] == roadmap_id for r in listed.json()["data"]))

    fetched = client.get(f"/roadmaps/{roadmap_id}", headers=headers)
    check("reopen restores session", fetched.json()["data"]["session"] == sample_session())
    check(
        "reopen restores resources without refetch",
        fetched.json()["data"]["resources"] == sample_resources(),
    )

    # 10. Progress updates persist across sessions.
    patched = client.patch(
        f"/roadmaps/{roadmap_id}",
        json={"progress": {"completedTopics": {"1:python basics": True, "1:variables": True}}},
        headers=headers,
    )
    check("progress patch returns 200", patched.status_code == 200)
    refetched = client.get(f"/roadmaps/{roadmap_id}", headers=headers)
    check(
        "progress persists",
        refetched.json()["data"]["progress"]["completedTopics"].get("1:variables") is True,
    )

    # Quiz attempts persist.
    quiz_attempt = [{"topic": "python basics", "score": 4, "total": 5}]
    client.patch(f"/roadmaps/{roadmap_id}", json={"quiz": quiz_attempt}, headers=headers)
    with_quiz = client.get(f"/roadmaps/{roadmap_id}", headers=headers)
    check("quiz attempts persist", with_quiz.json()["data"]["quiz"] == quiz_attempt)

    # 8. Guest import without regeneration, idempotent on retry.
    guest_payload = {
        "guest_id": "guest-roadmap-1",
        "title": "Guest Python Plan",
        "goal": "Learn Python",
        "session": sample_session(),
        "resources": sample_resources(),
        "progress": {"completedTopics": {}},
        "quiz": quiz_attempt,
    }
    imported = client.post("/roadmaps/import", json=guest_payload, headers=headers)
    check("guest import returns 201", imported.status_code == 201, imported.text[:200])
    imported_id = imported.json()["data"]["id"]
    check(
        "imported resources preserved",
        imported.json()["data"]["resources"] == sample_resources(),
    )
    reimported = client.post("/roadmaps/import", json=guest_payload, headers=headers)
    check("duplicate import returns same roadmap", reimported.json()["data"]["id"] == imported_id)
    after_import = client.get("/roadmaps", headers=headers)
    check(
        "no duplicate roadmaps after reimport",
        len(after_import.json()["data"]) == 2,
        str(len(after_import.json()["data"])),
    )

    # 9. Cross-user isolation.
    other = client.post(
        "/auth/signup",
        json={"name": "Other Learner", "email": "other@example.com", "password": "secret123"},
    )
    other_headers = {"Authorization": f"Bearer {other.json()['data']['token']}"}
    other_list = client.get("/roadmaps", headers=other_headers)
    check("other user sees empty list", other_list.json()["data"] == [])
    cross_read = client.get(f"/roadmaps/{roadmap_id}", headers=other_headers)
    check("cross-user read is not found", cross_read.status_code == 404)
    cross_patch = client.patch(
        f"/roadmaps/{roadmap_id}", json={"title": "Hijacked"}, headers=other_headers
    )
    check("cross-user update is not found", cross_patch.status_code == 404)
    cross_delete = client.delete(f"/roadmaps/{imported_id}", headers=other_headers)
    check("cross-user delete is not found", cross_delete.status_code == 404)
    unauthenticated = client.get("/roadmaps")
    check("roadmap list requires auth", unauthenticated.status_code == 401)

    # Delete flow.
    deleted = client.delete(f"/roadmaps/{imported_id}", headers=headers)
    check("delete returns 200", deleted.status_code == 200)
    gone = client.get(f"/roadmaps/{imported_id}", headers=headers)
    check("deleted roadmap is gone", gone.status_code == 404)

    # Sign out revokes the session.
    signout = client.post("/auth/signout", headers=headers)
    check("signout returns 200", signout.status_code == 200)
    after_signout = client.get("/auth/me", headers=headers)
    check("revoked token returns 401", after_signout.status_code == 401)

    print(f"All {PASS_COUNT} auth/roadmap checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
