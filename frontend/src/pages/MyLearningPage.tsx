import { AlertTriangle, BookOpen, Clock3, Plus, Trash2, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { buildSessionStateFromSnapshot } from "@/utils/restoreSession";
import { Button } from "@/components/common/Button";
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
      <div className="py-16 text-center text-sm font-semibold text-slate-500">
        Loading your learning...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {user ? `Saved for ${user.name}` : "My Learning"}
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">My Learning</h1>
        </div>
        <Link to="/onboarding">
          <Button size="large">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New roadmap
          </Button>
        </Link>
      </div>

      {error ? (
        <div
          className="flex items-start gap-3 rounded-[18px] border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      {roadmaps.length === 0 ? (
        <section className="glass-panel rounded-[24px] p-8 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-black text-slate-950">No saved roadmaps yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
            Create your first roadmap and it will appear here, ready to reopen
            exactly where you left off.
          </p>
          <Link className="mt-5 inline-block" to="/onboarding">
            <Button size="large">Create a roadmap</Button>
          </Link>
        </section>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {roadmaps.map((roadmap) => (
            <li className="glass-panel rounded-[24px] p-5" key={roadmap.id}>
              <h2 className="text-base font-black text-slate-950">{roadmap.title}</h2>
              {roadmap.goal ? (
                <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-500">
                  {roadmap.goal}
                </p>
              ) : null}
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                Updated {formatDate(roadmap.updated_at)}
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  disabled={busyId === `server-${roadmap.id}`}
                  onClick={() => void handleOpen(roadmap.id)}
                >
                  {busyId === `server-${roadmap.id}` ? "Opening..." : "Open"}
                </Button>
                <Button
                  disabled={busyId === `server-${roadmap.id}`}
                  onClick={() => void handleDelete(roadmap.id)}
                  variant="secondary"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {guestRoadmaps.length > 0 ? (
        <section className="glass-panel rounded-[24px] p-5">
          <h2 className="text-base font-black text-slate-950">On this device (guest)</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Guest roadmaps are stored only in this browser and are not available
            on other devices. Import one to keep it in your account.
          </p>
          <ul className="mt-4 space-y-3">
            {guestRoadmaps.map((guest) => (
              <li
                className="flex flex-col gap-3 rounded-[18px] border border-white/60 bg-white/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={guest.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{guest.title}</p>
                  <p className="text-xs font-semibold text-slate-400">
                    Updated {formatDate(guest.updatedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button onClick={() => handleOpenGuest(guest)} size="large" variant="secondary">
                    Open
                  </Button>
                  <Button
                    disabled={busyId === `guest-${guest.id}`}
                    onClick={() => void handleImport(guest)}
                    size="large"
                  >
                    <UploadCloud className="h-4 w-4" aria-hidden="true" />
                    {busyId === `guest-${guest.id}` ? "Importing..." : "Import"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
