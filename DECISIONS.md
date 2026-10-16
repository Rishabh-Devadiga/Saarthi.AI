# Architecture Decision Records — Authentication & Roadmap Persistence

Decisions after DEC-000 are new. (No prior DECISIONS.md existed; numbering
starts here and continues sequentially for future decisions.)

## DEC-001: Opaque bearer tokens instead of JWT

**Context:** The API needs authenticated sessions with no new infrastructure.
**Decision:** Random 256-bit bearer tokens (`secrets.token_urlsafe`); only the
SHA-256 hash is stored in `auth_sessions`. Validation hashes the presented
token and compares digests.
**Alternatives:** Signed JWTs (needs a signing secret + expiry/rotation
discipline, and revocation is hard); server sessions keyed by user id in
`localStorage` (forgeable).
**Trade-offs:** Every authenticated request does one indexed DB lookup; in
exchange revocation is instant (sign-out deletes nothing client-side that
matters) and there is no signing-secret management. Token value appears once
(signup/signin response) and is never logged or stored client-side beyond the
single `saarthi-auth-token` key.

## DEC-002: PBKDF2-HMAC-SHA256 password hashing from the standard library

**Context:** No password-hashing library is installed (`bcrypt`/`passlib`
absent) and adding dependencies widens the Render build surface.
**Decision:** `hashlib.pbkdf2_hmac` with 600k iterations and a 16-byte random
salt per user, stored as `pbkdf2_sha256$iter$salt$hash`; verification uses
`hmac.compare_digest`.
**Alternatives:** `bcrypt`/`argon2` via new dependencies.
**Trade-offs:** PBKDF2 at 600k iterations is OWASP-acceptable but slower per
login (~0.3s) than bcrypt; acceptable for an interactive login flow, and zero
new packages keeps installs reproducible.

## DEC-003: `roadmaps` aggregate table alongside existing entity tables

**Context:** A roadmap must restore exactly (workflow snapshot, video cache,
completion map, quiz history). Existing tables (`learning_plans`,
`progress`, `feedback_history`, …) store per-entity audit rows but no video
metadata and no single restorable aggregate.
**Decision:** New `roadmaps` table (owner FK, title, goal, status, timestamps,
`session_json`, `resources_json`, `progress_json`, `quiz_json`,
`mentor_json`, `interview_json`, `guest_import_id`) as the restore source of
truth. The crew workflow keeps writing the existing entity tables unchanged.
**Alternatives:** Reconstructing the view from entity tables (loses video
metadata and completion maps); storing everything only in entity tables plus
a new resources table (more joins, same data).
**Trade-offs:** Some data exists in two shapes (audit rows + snapshot). The
snapshot is written once per save/update from frontend state, so they cannot
drift within a session; entity tables keep their history semantics.

## DEC-004: Video metadata is cached, never refetched on reopen

**Context:** YouTube discovery runs in the browser (`youtubeService.ts`);
reopening a roadmap used to refetch every topic.
**Decision:** `resources_json` (topic → video list) is saved with the roadmap
(server) or guest record (local). `LearningPlanPage` seeds its fetch cache
from the snapshot before any network decision and only requests topics absent
from it; a manual "Refresh resources" button is the sole refetch path.
**Alternatives:** Backend proxy for YouTube (bigger change, quota still spent
on reopen); time-based revalidation (violates the no-repeat requirement).
**Trade-offs:** Cached metadata can go stale; the explicit refresh button is
the documented remedy.

## DEC-005: Guest storage in versioned localStorage, not IndexedDB

**Context:** Guest sessions must survive refresh/navigation and hold video
metadata. Spec suggests IndexedDB or a suitable abstraction.
**Decision:** Versioned `localStorage` keys (`saarthi-guest-roadmaps-v1`)
holding the same snapshot shape as the server, with quota-failure tolerance.
**Alternatives:** IndexedDB (async API, more code, harder to test with the
repo's script-test convention).
**Trade-offs:** ~5MB limit is ample here because thumbnails are URLs, not
blobs; storage is per-browser/per-device, which is communicated in the UI.
No credentials are stored (guest records contain no tokens).

## DEC-006: Guest→account import is idempotent and regeneration-free

**Context:** Migration must preserve resources/progress without new API spend
and must not duplicate on retry.
**Decision:** `POST /roadmaps/import` keys on `guest_import_id`
(`guest:<guest-id>` + owner); a repeat import returns the existing row.
Guest-local data is deleted only after the server confirms success.
**Alternatives:** Client-side duplicate checks (racy); re-running generation
(rejected: costs quota, changes content).
**Trade-offs:** The import key couples one guest record to one account;
re-importing the same guest data into a *different* account creates a
separate copy, which is the desired semantics.

## DEC-007: Ownership enforced server-side via token identity

**Context:** Frontend-supplied user ids must never authorize access.
**Decision:** `get_current_user` resolves the owner from the validated bearer
session; every roadmap handler re-checks `roadmap.user_id`. Unknown-or-foreign
ids return 404 (no ownership oracle).
**Alternatives:** 403 for foreign ids (leaks existence); trusting a `user_id`
request field (forgeable).
**Trade-offs:** 404 conflates "missing" and "forbidden" for API consumers, but
the UI treats both as "not available", which is correct UX.

## DEC-008: Schema evolution via `create_all` + idempotent column patch

**Context:** No migration framework (no Alembic); `create_tables.py` is the
established process.
**Decision:** Keep `create_all` for new tables; add an idempotent
`ALTER TABLE users ADD COLUMN` step (Postgres `IF NOT EXISTS`, SQLite
pragma-checked) for `password_hash`.
**Alternatives:** Adopting Alembic (heavy for one column); manual SQL docs
only (error-prone on Render).
**Trade-offs:** Works for additive changes only; any future destructive
change needs a real migration plan.

## DEC-009: Script-style backend tests over pytest

**Context:** `pytest` is not installed and `tests/` is empty; backend
conventions are `backend/scripts/test_*.py` run directly.
**Decision:** `test_auth_roadmaps.py` uses FastAPI `TestClient` (via installed
`httpx`) against temp-file SQLite, covering auth, CRUD, isolation, import
idempotency, and persistence — no network, no LLM quota.
**Alternatives:** Adding pytest + fixtures (better long-term, but a new
dependency and convention).
**Trade-offs:** Script tests don't integrate with CI collectors; they run
with one command and match repo habits.

## DEC-010: Mentor/interview histories stay session-scoped for now

**Context:** Spec asks for mentor/interview history "where supported".
**Decision:** `mentor_json`/`interview_json` columns exist and round-trip, but
mentor chat and interview state live in page-local React state with no
existing persistence hook, so nothing writes them yet.
**Alternatives:** Lifting chat/interview state into session context to persist
it (large refactor of working features).
**Trade-offs:** Roadmap restore covers plan/resources/progress/quiz; mentor
and interview restart fresh per session. Documented, not silently dropped.

## DEC-011: Gemini circuit breaker for 503 storms

**Context:** Measured a full generation at 360.3s against the 180s frontend
timeout. Backend logs showed each agent stage burning ~25s per failed Gemini
attempt across all 4 keys before Groq was ever tried.
**Decision:** Count consecutive server-side Gemini failures process-wide
(`backend/core/llm.py`); after 2, skip remaining Gemini attempts and bypass
Gemini for 180s via a non-retryable `_GeminiCircuitOpen` sentinel. Any success
resets. Instant errors (400s) never count.
**Alternatives:** Raising the timeout (masks the problem, burns quota);
async job + polling (large redesign of the generation contract).
**Trade-offs:** A short healthy blip of 2 failures diverts one workflow to
Groq, which is verified-compatible; cooldown expiry re-probes Gemini
automatically. Observed storm workflow completed in 76.88s with the breaker.

## DEC-012: Duplicate-email signup shows a sign-in path, not a raw error

**Context:** `409 email_taken` surfaced as a generic "API request failed"
alert with no next step.
**Decision:** `SignUpPage` branches on `ApiRequestError.errorCode ===
"email_taken"` and renders a dedicated notice with a link to `/signin`.
**Alternatives:** Generic message only (user dead-ends); auto-redirect to
signin (loses form context and surprises).
**Trade-offs:** One code-specific branch in the page; all other errors keep
the generic alert path.

## DEC-013: Navigation and redirects run in effects, never during render

**Context:** Auth pages called `navigate()` in the render body, triggering
React's "update while rendering another component" warning.
**Decision:** Redirect-on-authenticated moved into `useEffect`; render returns
null while redirecting.
**Alternatives:** `<Navigate>` element (equivalent, but the effect keeps the
existing imperative style consistent across both pages).
**Trade-offs:** One extra null render; no behavioral change.

## DEC-014: Failed server save falls back to a guest-local copy

**Context:** If roadmap persistence fails after a minutes-long generation
(e.g. expired token → 401), the plan existed only in memory and was lost.
**Decision:** `OnboardingPage` catches server-save failure and saves the same
snapshot to the guest store, navigating to the guest roadmap URL instead.
**Alternatives:** Error screen with retry (user still risks losing work on a
dead session); silent drop (data loss).
**Trade-offs:** An authenticated user can briefly hold a guest copy; the
My Learning import flow already reunites it with the account.

## DEC-015: Expired sessions clear state without forced navigation

**Context:** A global 401 → `/signin` redirect wiped in-progress forms (e.g.
a wrong-password message) and yanked users mid-flow.
**Decision:** The `UNAUTHORIZED_EVENT` handler only clears auth/session
storage; each surface reacts appropriately (forms keep errors, `MyLearning`
redirects itself, roadmap pages show restore errors, sign-out reloads to `/`).
**Alternatives:** Allow-listing non-redirect endpoints (fragile, grows with
every route).
**Trade-offs:** A freshly expired background session no longer announces
itself until the next auth-gated view; acceptable versus destroying input.

## DEC-016: Restore gates video fetching; progress is synthesized if absent

**Context:** Two restore defects found by test: (1) on reload, the plan
arrives from `sessionStorage` before the roadmap fetch returns, so unseeded
topics refetched from YouTube; (2) toggling topics is a no-op when a restored
snapshot lacks a progress report (reducer requires one).
**Decision:** `LearningPlanPage` blocks the fetch effect until restore settles
(`roadmapReadyRef`) and always reseeds from the fetched snapshot;
`buildSessionStateFromSnapshot` synthesizes a minimal progress report from
plan phases when none exists.
**Alternatives:** Persisting videos into session state (duplicates the
roadmap store); disabling toggles without a report (breaks progress on
restored roadmaps).
**Trade-offs:** One extra cheap `GET /roadmaps/:id` per mount with a param;
synthesized progress starts at 0% by construction.
