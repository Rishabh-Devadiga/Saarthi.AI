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

## DEC-017: Production frontend `VITE_API_BASE_URL` must point to the backend service

**Context:** The deployed frontend at `https://saarthi-ai-ochre.vercel.app/signin`
reported HTTP 404 on `POST /auth/signin`. The request was reaching a different
Vercel host (`saarthi-ai-kc1*.vercel.app`) that does not serve the FastAPI auth
routes, instead of the actual backend (Railway per the deployment diagram in
`README.md`). `VITE_API_BASE_URL` had been set to that wrong host in the Vercel
project environment.
**Decision:** `VITE_API_BASE_URL` in the Vercel frontend project must point to
the deployed backend service (the Railway FastAPI host, e.g.
`https://<railway-backend-domain>`), never to a Vercel/frontend host or to
`localhost`. It is set in the deployment platform, never committed to Git, and
the frontend code reads it at build time via `import.meta.env.VITE_API_BASE_URL`
(`frontend/src/api/apiClient.ts`). The backend route prefixes (`/auth/*`,
`/roadmaps/*`) are already registered correctly in `backend/api/router.py` and
require no code change.
**Alternatives:** Changing the frontend source to a hard-coded URL (breaks
local dev and environment parity); adding duplicate/mismatched endpoints on the
backend (masks the config error and creates drift); suppressing the 404 (hides
the misconfiguration).
**Trade-offs:** Requires access to the Vercel project settings and a frontend
redeploy after the env var is corrected. The exact production backend host is
not stored in the repo; it must be obtained from the Railway/Vercel dashboards
and verified against the deployed `/auth/signin` endpoint before declaring the
incident resolved.

## DEC-018: Client-side API errors are classified into actionable user messages

**Context:** The axios response interceptor surfaced every failure as
`API request failed: <message>`, so a missing route showed the unhelpful raw
text `Request failed with status code 404`, and an unreachable backend showed
the raw transport error. Users could not tell whether the sign-in service was
down, misconfigured, or rejecting credentials.
**Decision:** `frontend/src/api/apiClient.ts` classifies errors before surfacing
them: a network-level failure (no response) reports that the authentication
service is unavailable and to retry later; an HTTP 404 reports that the sign-in
endpoint is not available and the service may be misconfigured; all other
statuses use the server-provided `message` when present. The `ApiRequestError`
still carries `errorCode` (server `error_code`) and `statusCode` so callers such
as `SignUpPage` (DEC-012, `email_taken`) and 401 handling continue to work.
**Alternatives:** One generic message for every failure (user dead-ends);
returning raw Axios messages (unhelpful for 404/network failures).
**Trade-offs:** Messages are service-agnostic wording; the exact remediation
(e.g. contact support) is phrased as guidance rather than a promise.

## DEC-019: Production database schema initialization is idempotent and self-healing

**Context:** The deployed Render backend returned HTTP 500 on
``POST /auth/signup`` with ``psycopg2.errors.UndefinedTable: relation "users"
does not exist``. The production PostgreSQL database had been provisioned, but
the application schema (``users``, ``auth_sessions``, ``roadmaps``, and the
other workflow tables) had never been initialized against it. No migration
framework (Alembic) is in use; ``backend/scripts/create_tables.py`` is the
established process.
**Decision:** ``create_tables.py`` is refactored so its work is exposed as the
importable, idempotent ``ensure_schema()``: ``Base.metadata.create_all`` only
creates tables that are still missing, and the ``users.password_hash`` column
patch uses PostgreSQL ``ADD COLUMN IF NOT EXISTS``. Running it against an
existing production database never drops or alters data. Additionally,
``backend/main.py`` runs ``ensure_schema()`` inside the FastAPI ``lifespan``
startup hook, so every deploy self-heals missing tables without a manual step.
The script is also safe to run explicitly on Render's production database via
the Render shell/one-off command using the production ``DATABASE_URL``.
**Alternatives:** Adopting Alembic (heavy for this schema); relying solely on a
manual one-off command (easy to forget, so future deploys can regress); running
``create_all`` unconditionally without the ``IF NOT EXISTS`` column patch
(fails on databases that predate the auth column).
**Trade-offs:** Startup schema initialization adds a small DB round-trip on
every deploy and assumes the connecting role has ``CREATE`` privilege on the
target schema (Render's provisioned role does). Additive-only changes are
supported; any future destructive schema change needs a real migration plan.

## DEC-020: Two-surface Lumen redesign scoped with a `.lumen` shell and a locked design record

**Context:** The landing page (`/`) and the five-step onboarding wizard
(`/onboarding`) are the product's first impressions, but they had drifted from
the rest of the app into a collage of Space-shell visual clichés — purple-to-blue
gradients, glass cards, hard shadows, and an uppercase landing-register that no
other surface shares. A Hallmark sweep of the whole codebase still reported most
of its findings on those two pages. A full design migration of every workspace
page was out of budget and beyond the risk the product could absorb in one
change; only the two conversion surfaces were in scope for a redesign.
**Decision:** The two pages were fully redesigned inside Hallmark's Lumen theme
(genre atmospheric): a violet-black paper ground (`--color-paper: oklch(12.5% 0.027 290)`), roman-serif lowercase display heads ("Instrument Serif", one
rose-accented verb), mono readouts for measured figures ("Geist Mono", tabular
nums), a warm brass control accent, and hairline rules instead of shadows. The
landing is rebuilt around the product's own mechanic — the five answers
(goal, level, time, deadline, preferences) drawn as a brass-ruled path in the
hero and re-used as the wizard's progress vocabulary — followed by capability
rows, a duotone key-art band, an FAQ, and a close band restated as a statement
with three entries across. The onboarding wizard is a single card-headed app
screen: a five-node path progress, numbered choice wells (`role="radio"`
buttons), a slider with a live mono read-back well, a date field with helper
copy (`aria-describedby`), a preference pill set, and a LoadingScreen that reads
the five answers back in mono with the deadline humanized through the newly
exported `formatTargetDate`. All token definitions live in
``frontend/src/styles/tokens.css``; the Lumen system is scoped to ``.lumen``
shells in ``frontend/src/styles/globals.css``, and ``AppLayout`` keeps calling
its legacy base for every other route, so workspace pages render untouched.
Functionality was preserved and recorded: the sweep's kept-gate acknowledged
links 17/18 (``#about`` dropped on record), fields 1/1, handlers 111/112
(``handleStartJourney`` dropped on record — the CTA links to ``/onboarding``),
figures 1/1, and 16 reworded headings recorded in the `globals.css` stamp block.
``frontend/src/components/onboarding/validation.ts`` is byte-identical; no
handler logic, route, field, or API integration changed. The render tier
finished with zero reflex findings across both pages, four acknowledgements are
recorded as stamp waivers (gate 38iii lone-rose-verb, gate 29 nav backdrop blur,
gate 77 section-count heuristic misapplied to an app screen, gate 79 wizard-hero
detection artifact), and the locked system is written to ``DESIGN.md`` at the
repo root with the run logged in ``.hallmark/log.json``.
**Alternatives:** Reskinning the whole app in one pass (too large a blast
radius for a two-person cadence); keeping the old hero's layered parallax
slices (dropped and recorded — the key-art band carries the imagery); a light
theme variant (the atmospheric genre deal selected this seed's dark axes; a
light Lumen would be a new theme deal, not a tweak).
**Trade-offs:** Two design dialects coexist until the next page migrates —
`.lumen` shells on the two redesigned surfaces, the project's legacy utility
base elsewhere — so the codebase carries both token sets for a while. The
sweep's inherited out-of-scope findings stay untouched on purpose and are
recorded in the stamp as debt, not fixed here: `.dark-workspace` purple-to-blue
gradients, pure ``#ffffff`` legacy text utilities, the ``interview-wave`` height
keyframes, and the ``.page-heading``/`.glass-panel` colour literals. The
dropped parallax assets (``frontend/public/images/space/*`` and
``logo-mark.png``) and three unused legacy landing files
(``FeatureCard``, ``Benefits``, ``HowItWorks``) remain on disk, unreferenced and
lint-flagged, for a later cleanup commit. The production bundle keeps the
pre-existing >500 kB chunk warning.

## DEC-021: The hero artifact and one shared gap rhythm replace the decorative band

**Context:** The locked Lumen system (``DEC-020``) shipped with a hero whose
right panel floated its readout over centered pill stacks in a dead grid, a
duotone space-illustration band between sections, disabled pills shaded brass
at 55% opacity, and wizard progress hairlines that stopped short of the next
node. The owner's polish brief asked for a meaningful hero visual, removal of
the decorative illustration, typographic and layout precision, and a production
pass across all five wizard steps with functionality preserved.
**Decision:** The hero's right panel is rebuilt as the intake-to-outcome
artifact the page already speaks: the five numbered answer chips in the same
split the wizard uses (``sm:grid-cols-2``, the fifth spanning both — the shape
of GoalStep's radiogroup), one aria-hidden brass rail node, and a ``dl`` legend
reading ``phased`` / ``dated`` / ``checked`` in the product's own vocabulary —
real text, unwrapped from ``role="img"`` so screen readers read it.
``#how-it-works`` moves from the hero panel to the product-at-work captures
(the old anchor landed on content already in view; the dropped ``id="product"``
was unreferenced), so "how it works" now scrolls to the captures section.
``KeyArtBand`` and its ``.l-art`` duotone CSS are deleted; content sections
breathe on one shared top-only ``--section-gap`` rhythm instead of stacked
top-and-bottom pads. The wizard path becomes equal ``flex-1`` cells with
absolute node-to-node hairlines that land centre to centre at any width and
any label length, and disabled pills read neutral (``paper-3``/muted) rather
than muddy brass. The step-5 caption takes the page's lowercase register and
the loading stages use the true typographic ellipsis. No wiring changed — the
kept-gate recorded links 18/18, fields 1/1, handlers 111/111, headings 14/14,
figures 1/1 against the before-record, with ``192 FAIL / 0 REFLEX`` unchanged
(all inherited out-of-scope debt).
**Alternatives:** Replacing the illustration with another decorative image
(the owner ruled it out — the product's captures carry the visual experience);
keeping the anchor inside the hero panel (it scrolled nowhere, so the nav item
was honest only by accident); opacity-based disabled states (brass at 55%
reads muddy brown over dark paper).
**Trade-offs:** The render tier counts the artifact's copy as "text blocks
before the hero's actions" — accepted, because the artifact is the hero's
designed second voice, not filler. Eight new stamp lines extend the
``globals.css`` header record. The other four F2 ellipsis flags stay as
recorded out-of-scope debt (``InterviewResults``, ``TypingIndicator``,
``LearningPlanPage``, ``MyLearningPage``), and the >500 kB chunk warning
remains pre-existing.

## DEC-022: Display copy moves to Title Case; the lowercase register is scoped to the mono lanes

**Context:** The owner asked the locked Lumen register to change. Until this
pass every head, nav link, control and label rendered through a CSS
``text-transform: lowercase`` (``h1-h3``, ``nav/button/label/th/figcaption/
legend`` and ``.l-navlink``), whatever its source strings said. The brief:
main headings, section titles, navigation labels and CTA buttons in
consistent Title Case; body copy in sentence case; small technical labels and
decorative microcopy stay lowercase where appropriate; hierarchy, spacing,
aesthetic and functionality unchanged.
**Decision:** The transforms are lifted — from the ``.lumen`` heading rule,
from ``nav`` and ``button`` in the element register rule, and from
``.l-navlink`` — so copy sets its own case; ``label``, ``th``, ``figcaption``
and ``legend`` keep the small lowercase register. Head strings are
hand-titled (minor words lowercase, verbs and brands capitalized), body
paragraphs are capitalized as sentences, and three mono lanes stay lowercase
deliberately: ``l-readout`` (the eyebrow, "five answers in", "roadmap out",
the roadmap legend cells, capture captions, wizard path labels), ``.l-caption``
(microcopy notes like "no account needed to start." and "your journey starts
here."), and field labels/dividers. The wizard choice wells now render as
typed ("Become a Data Scientist", "Beginner"), the accordion FAQ questions
stay sentence case, and validation messages were already sentence case. No
routes, handlers, payloads or styles other than the removed transforms
changed — the kept-gate recorded links 18/18, fields 1/1, handlers 111/111,
headings 14/14, figures 1/1, with ``192 FAIL / 0 REFLEX`` unchanged.
**Alternatives:** A Tailwind ``capitalize`` transform on heads (Title-Cases
every word mechanically, wrong for "the"/"with" and acronyms like FAQ);
per-component transform overrides (scatters the register instead of owning it
once in the Lumen layer); leaving the wizard wells lowercase (a different
product voice inside the Title Case shells).
**Trade-offs:** Every display string now carries its case in source, so
future copy edits must hand-title; the hero's lone accented verb stays
"Plans" under the recorded 38iii waiver; the mono lanes' lowercase is now an
explicit design decision rather than a page-wide transform, so both registers
must be respected in future copy.

## DEC-023: Every post-onboarding surface moves onto Lumen; the shell loses the theme switch and owns no page head

**Context:** DEC-020 locked Lumen for the sign-up anatomy (``/`` and
``/onboarding``), DEC-021 polished it, and DEC-022 set the register — but
every post-onboarding surface (dashboard, chat plan intake, learning plan,
quiz, AI mentor, mock interview, progress, feedback, my learning) still sat
on the project's legacy blue/glass system (``workspace-shell``,
``dark-workspace``, ``glass-panel``, ``blue-pill``, ``metric-card``) inside
an ``AppLayout`` that owned a ``Learning Report`` h1, a light/dark theme
switch and a static header date. The owner asked every workspace page to
match the landing's premium quality, with each page composed differently
rather than repeated generic cards, functionality and wiring preserved
end-to-end, and ``/api-test`` kept as its plain utility canvas; auth pages
stay out of scope for now.
**Decision:** The whole cluster is rewritten on the Lumen tokens under a
``.lumen-workspace`` scope so the app register steps down from the marketing
one (h1 ``--text-2xl``, h2 ``--text-title``, h3 the body face at 500): each
page keeps an editorial head pattern (lowercase mono readout eyebrow over a
Title Case head), the dashboard pairs the conic today's-goal ring, token
themed recharts and hairline ledger strips, chat/mentor run the deep
``l-stage`` well with brass user bubbles, quiz options and interview setup
take the brass-ruled ``l-choice`` wells, interview adds the ``l-stage``
interviewer/candidate mats with the live-coloured status dots, and progress
leads with the completion estimate over the ``l-meter`` rails. The legacy
utilities retire from the workspace (they stay for auth pages and api-test).
``AppLayout`` drops its shell h1 — each page owns its identity now — and
drops the theme switch entirely: Lumen is a dark-paper system with no light
variant on record, so a light/dark toggle would present a surface the system
never designed. The header keeps a live lowercase date readout (now
including the year, visible from ``sm``), the notifications popover renders
as an ``l-well`` card, search lives only on the learning-plan route, and the
sidebar brand is the logo image returning home. New token-based primitives:
``l-raillink``, ``l-meter``/``l-meter-fill`` (width set, never animated),
``l-tag``, ``l-stage``, ``l-enter``, ``l-ledger``, ``workspace-utility``;
``interview-wave-bar`` moves into the Lumen layer. Buttons inside scope use
the native ``l-pill`` pair; the shared ``Button`` component is untouched for
the auth pages. All handlers, payloads, roadmap generation/restore, guest
flows and quiz-attempt persistence are byte-for-byte logic. The kept-gate
recorded links 21/21, fields 6/6, handlers 109/111 (2 dropped on record: the
theme-switch dark/light handlers), headings 22/23 (1 dropped on record: the
shell's "Learning Report" head), figures 2/2, with the FAIL total moving
219 → 139 and REFLEX 13 → 9 (all remaining gate findings are inherited
out-of-scope debt in the legacy base layer). Lint and build pass.
**Alternatives:** Keeping one shared dashboard-card grid (rejected — the
brief asked for distinctive per-page compositions); keeping the theme switch
with a second light token set (rejected — no light art direction exists in
the record, so a toggle would ship an un-designed state); restyling
signin/signup in the same pass (out of scope — they remain on the legacy
canvas until their own brief); recording the removed shell head and handlers
without stamps (rejected — the kept contract requires drops to state a
reason on the record).
**Trade-offs:** The theme switch is a real capability the owner may want
back; restoring it means designing a light Lumen variant, not re-adding a
control against unavailable tokens. Every page now carries its own head, so
new routes must opt into the editorial head pattern. The glance metrics that
used to live in the shell head read instead from the dashboard and progress
pages. Two dropped stamps extend the ``globals.css`` record, and the >500 kB
chunk warning remains pre-existing.
