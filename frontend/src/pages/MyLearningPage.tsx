import { AlertTriangle, BookOpen, Clock3, Plus, Trash2, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { buildSessionStateFromSnapshot } from "@/utils/restoreSession";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "@/context/SessionContext";
import { setActiveRoadmap } from "@/utils/activeRoadmap";
import { getRoadmap, importGuestRoadmap, listRoadmaps, deleteRoadmap } from "@/api/roadmapsApi";
import type { RoadmapSummary } from "@/types/roadmaps";
import {
  deleteGuestRoadmap,
  getGuestRoadmap,
  listGuestRoadmaps,
  toRoadmapSnapshot,
  type GuestRoadmap,
} from "@/utils/guestRoadmaps";

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function MyLearningPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { dispatch } = useSession();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState<RoadmapSummary[]>([]);
  const [guestRoadmaps, setGuestRoadmaps] = useState<GuestRoadmap[]>(() =>
    listGuestRoadmaps()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listRoadmaps();
      setRoadmaps(response.data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load roadmaps.");
    } finally {
      setIsLoading(false);
    }
    setGuestRoadmaps(listGuestRoadmaps());
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!isAuthenticated) {
      navigate("/signin", { replace: true });
      return;
    }
    let cancelled = false;
    listRoadmaps()
      .then((response) => {
        if (cancelled) {
          return;
        }
        setRoadmaps(response.data);
        setGuestRoadmaps(listGuestRoadmaps());
        setIsLoading(false);
      })
      .catch((requestError: unknown) => {
        if (cancelled) {
          return;
        }
        setError(
          requestError instanceof Error ? requestError.message : "Unable to load roadmaps."
        );
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAuthLoading, navigate]);

  async function handleOpen(id: number) {
    setBusyId(`server-${id}`);
    setError(null);
    try {
      const response = await getRoadmap(id);
      dispatch({
        type: "SESSION_RESTORE",
        payload: buildSessionStateFromSnapshot({
          session: response.data.session,
          progress: response.data.progress,
        }),
      });
      setActiveRoadmap({ id: String(id), source: "server" });
      navigate(`/learning-plan?roadmap=${id}&source=server`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to open roadmap.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    setBusyId(`server-${id}`);
    setError(null);
    try {
      await deleteRoadmap(id);
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete roadmap.");
    } finally {
      setBusyId(null);
    }
  }

  function handleOpenGuest(guest: GuestRoadmap) {
    const stored = getGuestRoadmap(guest.id) ?? guest;
    dispatch({
      type: "SESSION_RESTORE",
      payload: buildSessionStateFromSnapshot({
        session: stored.session,
        progress: { completedTopics: stored.completedTopics },
      }),
    });
    setActiveRoadmap({ id: stored.id, source: "guest" });
    navigate(`/learning-plan?roadmap=${stored.id}&source=guest`);
  }

  async function handleImport(guest: GuestRoadmap) {
    setBusyId(`guest-${guest.id}`);
    setError(null);
    try {
      await importGuestRoadmap({ ...toRoadmapSnapshot(guest), guest_id: guest.id });
      deleteGuestRoadmap(guest.id);
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to import roadmap.");
    } finally {
      setBusyId(null);
    }
  }

  if (isAuthLoading || (isLoading && roadmaps.length === 0 && guestRoadmaps.length === 0)) {
    return (
      <div className="l-readout py-16 text-center">
        Loading your learning…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="l-enter flex flex-col gap-3 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="l-readout">
            {user ? `Saved for ${user.name}` : "My Learning"}
          </p>
          <h1 className="mt-2">My Learning</h1>
        </div>
        <Link to="/onboarding">
          <span className="l-pill l-pill-primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Roadmap
          </span>
        </Link>
      </div>

      {error ? (
        <div
          className="l-alert flex items-start gap-3 p-4"
          role="alert"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-error"
            aria-hidden="true"
          />
          <span className="leading-6 text-ink-2">{error}</span>
        </div>
      ) : null}

      {roadmaps.length === 0 ? (
        <section className="l-card p-8 text-center">
          <BookOpen
            className="mx-auto h-8 w-8 text-muted"
            aria-hidden="true"
          />
          <h2 className="mt-3">No saved roadmaps yet</h2>
          <p className="l-caption mx-auto mt-2 max-w-md leading-6">
            Create your first roadmap and it will appear here, ready to reopen
            exactly where you left off.
          </p>
          <Link className="mt-5 inline-block" to="/onboarding">
            <span className="l-pill l-pill-primary">Create a Roadmap</span>
          </Link>
        </section>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {roadmaps.map((roadmap) => (
            <li
              className="l-card flex flex-col p-5"
              key={roadmap.id}
            >
              <h2 className="text-lg">{roadmap.title}</h2>
              {roadmap.goal ? (
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-ink-2">
                  {roadmap.goal}
                </p>
              ) : null}
              <p className="l-readout mt-2 inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                updated {formatDate(roadmap.updated_at)}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  className="l-pill l-pill-primary"
                  disabled={busyId === `server-${roadmap.id}`}
                  onClick={() => void handleOpen(roadmap.id)}
                  type="button"
                >
                  {busyId === `server-${roadmap.id}` ? "Opening…" : "Open"}
                </button>
                <button
                  className="l-pill l-pill-ghost"
                  disabled={busyId === `server-${roadmap.id}`}
                  onClick={() => void handleDelete(roadmap.id)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {guestRoadmaps.length > 0 ? (
        <section className="l-card p-5">
          <p className="l-readout">on this device (guest)</p>
          <h2 className="mt-2">Guest Roadmaps</h2>
          <p className="l-caption mt-2 leading-6">
            Guest roadmaps are stored only in this browser and are not available
            on other devices. Import one to keep it in your account.
          </p>
          <ul className="mt-4 space-y-3">
            {guestRoadmaps.map((guest) => (
              <li
                className="l-well flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={guest.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{guest.title}</p>
                  <p className="l-readout mt-1">
                    updated {formatDate(guest.updatedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    className="l-pill l-pill-ghost"
                    onClick={() => handleOpenGuest(guest)}
                    type="button"
                  >
                    Open
                  </button>
                  <button
                    className="l-pill l-pill-primary"
                    disabled={busyId === `guest-${guest.id}`}
                    onClick={() => void handleImport(guest)}
                    type="button"
                  >
                    <UploadCloud className="h-4 w-4" aria-hidden="true" />
                    {busyId === `guest-${guest.id}` ? "Importing…" : "Import"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
