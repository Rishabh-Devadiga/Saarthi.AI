import { CheckCircle2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { EmptyPlan } from "@/components/learning-plan/EmptyPlan";
import { PhaseTimeline } from "@/components/learning-plan/PhaseTimeline";
import { PlanHeader } from "@/components/learning-plan/PlanHeader";
import { Button } from "@/components/common/Button";
import { useSession } from "@/context/SessionContext";
import {
  searchYouTubeTutorials,
  YouTubeSearchError,
  type YouTubeVideo,
} from "@/services/youtubeService";
import { getRoadmap, updateRoadmap } from "@/api/roadmapsApi";
import type { LearningPhase } from "@/types/learning";
import { getActiveRoadmap, setActiveRoadmap } from "@/utils/activeRoadmap";
import { getGuestRoadmap, saveGuestRoadmap } from "@/utils/guestRoadmaps";
import { buildSessionStateFromSnapshot } from "@/utils/restoreSession";
import { getTopicKey } from "@/utils/learningPlan";

export function LearningPlanPage() {
  const { state, toggleTopicCompletion, dispatch } = useSession();
  const [searchParams] = useSearchParams();
  const plan = state.learningPlan;
  const searchQuery = searchParams.get("q")?.trim() ?? "";
  const roadmapParam = searchParams.get("roadmap");
  const sourceParam = searchParams.get("source");
  const [videos, setVideos] = useState<Record<string, YouTubeVideo[]>>({});
  const [loadingTopics, setLoadingTopics] = useState<Record<string, boolean>>({});
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const fetchedTopicsRef = useRef<Record<string, YouTubeVideo[]>>({});
  const requestedTopicsRef = useRef<Set<string>>(new Set());
  const activePlanKeyRef = useRef<string | null>(null);
  const seededCacheRef = useRef<Record<string, YouTubeVideo[]>>({});
  const syncedProgressRef = useRef<string | null>(null);
  const roadmapReadyRef = useRef(!roadmapParam);
  const planKey = useMemo(
    () =>
      plan
        ? JSON.stringify({
            goal: plan.learning_goal,
            phases: plan.phases.map((phase) => ({
              phase: phase.phase_number,
              topics: phase.recommended_topics,
            })),
          })
        : null,
    [plan]
  );
  const topicEntries = useMemo(
    () =>
      plan?.phases.flatMap((phase) =>
        phase.recommended_topics.map((topic) => ({
          key: getTopicKey(phase.phase_number, topic),
          topic,
          topicCacheKey: getTopicCacheKey(topic),
        }))
      ) ?? [],
    [plan]
  );

  function asVideoCache(value: unknown): Record<string, YouTubeVideo[]> {
    if (typeof value !== "object" || value === null) {
      return {};
    }
    const cache: Record<string, YouTubeVideo[]> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (Array.isArray(entry)) {
        cache[key] = entry as YouTubeVideo[];
      }
    }
    return cache;
  }

  function seedVideoCache(cached: Record<string, YouTubeVideo[]>) {
    seededCacheRef.current = { ...cached };
    fetchedTopicsRef.current = { ...cached };
    requestedTopicsRef.current = new Set(Object.keys(cached));
  }

  // Restore a saved roadmap (server or guest) when opened with ?roadmap=&source=.
  // The snapshot is always reloaded and its video metadata reseeds the cache,
  // so reopening (or refreshing) never refetches from YouTube.
  useEffect(() => {
    if (!roadmapParam || (sourceParam !== "server" && sourceParam !== "guest")) {
      return;
    }
    if (activePlanKeyRef.current === `restored:${sourceParam}:${roadmapParam}`) {
      roadmapReadyRef.current = true;
      return;
    }
    roadmapReadyRef.current = false;
    let isMounted = true;
    setIsRestoring(true);
    setRestoreError(null);
    void (async () => {
      try {
        if (sourceParam === "server") {
          const roadmapId = Number(roadmapParam);
          if (!Number.isInteger(roadmapId) || roadmapId <= 0) {
            throw new Error("Roadmap not found.");
          }
          const response = await getRoadmap(roadmapId);
          if (!isMounted) {
            return;
          }
          dispatch({
            type: "SESSION_RESTORE",
            payload: buildSessionStateFromSnapshot({
              session: response.data.session,
              progress: response.data.progress,
            }),
          });
          setActiveRoadmap({ id: roadmapParam, source: "server" });
          seedVideoCache(asVideoCache(response.data.resources));
        } else {
          const guest = getGuestRoadmap(roadmapParam);
          if (!guest) {
            throw new Error("Guest roadmap not found on this device.");
          }
          if (!isMounted) {
            return;
          }
          dispatch({
            type: "SESSION_RESTORE",
            payload: buildSessionStateFromSnapshot({
              session: guest.session,
              progress: { completedTopics: guest.completedTopics },
            }),
          });
          setActiveRoadmap({ id: guest.id, source: "guest" });
          seedVideoCache(guest.resources);
        }
        if (isMounted) {
          activePlanKeyRef.current = `restored:${sourceParam}:${roadmapParam}`;
        }
      } catch (requestError) {
        if (isMounted) {
          setRestoreError(
            requestError instanceof Error ? requestError.message : "Unable to open roadmap."
          );
        }
      } finally {
        if (isMounted) {
          roadmapReadyRef.current = true;
          setIsRestoring(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [dispatch, roadmapParam, sourceParam]);

  function backfillVideoCache(fresh: Record<string, YouTubeVideo[]>) {
    const merged = { ...seededCacheRef.current, ...fresh };
    seededCacheRef.current = merged;
    const active = getActiveRoadmap();
    if (!active) {
      return;
    }
    if (active.source === "server") {
      const roadmapId = Number(active.id);
      if (!Number.isInteger(roadmapId) || roadmapId <= 0) {
        return;
      }
      void updateRoadmap(roadmapId, { resources: merged }).catch(() => {
        // Cache backfill is best-effort; the videos are already on screen.
      });
      return;
    }
    const guest = getGuestRoadmap(active.id);
    if (guest) {
      saveGuestRoadmap({ ...guest, resources: merged });
    }
  }

  // Persist progress toggles into the open roadmap.
  useEffect(() => {
    const active = getActiveRoadmap();
    if (!active || !plan) {
      return;
    }
    const fingerprint = JSON.stringify(state.completedTopics);
    if (syncedProgressRef.current === fingerprint) {
      return;
    }
    syncedProgressRef.current = fingerprint;
    const payload = { completedTopics: state.completedTopics };
    if (active.source === "server") {
      const roadmapId = Number(active.id);
      if (!Number.isInteger(roadmapId) || roadmapId <= 0) {
        return;
      }
      void updateRoadmap(roadmapId, { progress: payload }).catch(() => {
        syncedProgressRef.current = null;
      });
      return;
    }
    const guest = getGuestRoadmap(active.id);
    if (guest) {
      saveGuestRoadmap({ ...guest, completedTopics: state.completedTopics });
    }
  }, [state.completedTopics, plan, roadmapParam]);

  function handleRefreshResources() {
    fetchedTopicsRef.current = {};
    requestedTopicsRef.current = new Set();
    seededCacheRef.current = {};
    setVideos({});
    setYoutubeError(null);
    const active = getActiveRoadmap();
    if (!active) {
      return;
    }
    if (active.source === "server") {
      const roadmapId = Number(active.id);
      if (Number.isInteger(roadmapId) && roadmapId > 0) {
        void updateRoadmap(roadmapId, { resources: {} }).catch(() => undefined);
      }
      return;
    }
    const guest = getGuestRoadmap(active.id);
    if (guest) {
      saveGuestRoadmap({ ...guest, resources: {} });
    }
  }

  useEffect(() => {
    let isMounted = true;

    if (!planKey) {
      return;
    }

    // Wait for roadmap restore so the seeded cache is in place first.
    if (!roadmapReadyRef.current) {
      return;
    }

    if (activePlanKeyRef.current !== planKey) {
      if (roadmapParam) {
        // A restored roadmap seeds its own cache; never wipe it here.
        activePlanKeyRef.current = planKey;
      } else {
        activePlanKeyRef.current = planKey;
        requestedTopicsRef.current = new Set();
        fetchedTopicsRef.current = {};
        seededCacheRef.current = {};
      }
    }

    // Render already-cached videos immediately without any API call.
    const cachedEntries = topicEntries.filter(
      (entry) => entry.topicCacheKey in fetchedTopicsRef.current
    );
    if (cachedEntries.length > 0) {
      const cachedVideos = Object.fromEntries(
        topicEntries.map((entry) => [
          entry.key,
          fetchedTopicsRef.current[entry.topicCacheKey] ?? [],
        ])
      );
      void Promise.resolve().then(() => {
        if (isMounted) {
          setVideos(cachedVideos);
        }
      });
    }

    const uniqueMissingTopics = Array.from(
      new Map(
        topicEntries
          .filter(
            (entry) =>
              !(entry.topicCacheKey in fetchedTopicsRef.current) &&
              !requestedTopicsRef.current.has(entry.topicCacheKey)
          )
          .map((entry) => [entry.topicCacheKey, entry])
      ).values()
    );

    if (uniqueMissingTopics.length === 0) {
      return;
    }

    uniqueMissingTopics.forEach((entry) => {
      requestedTopicsRef.current.add(entry.topicCacheKey);
    });
    void Promise.resolve().then(() => {
      if (!isMounted) {
        return;
      }

      setLoadingTopics((currentValue) => ({
        ...currentValue,
        ...Object.fromEntries(
          uniqueMissingTopics.map((entry) => [entry.key, true])
        ),
      }));
    });

    void Promise.allSettled(
      uniqueMissingTopics.map(async (entry) => {
        const videos = await searchYouTubeTutorials(entry.topic).catch((error) => {
          if (error instanceof YouTubeSearchError) {
            throw error;
          }
          throw new YouTubeSearchError("Unable to load YouTube tutorials.");
        });
        return { topicCacheKey: entry.topicCacheKey, videos };
      })
    )
      .then((settledResults) => {
        if (!isMounted) {
          return;
        }

        const failures: string[] = [];
        settledResults.forEach((result, index) => {
          const topic = uniqueMissingTopics[index];
          if (result.status === "fulfilled") {
            fetchedTopicsRef.current[topic.topicCacheKey] = result.value.videos;
            return;
          }

          fetchedTopicsRef.current[topic.topicCacheKey] = [];
          failures.push(
            result.reason instanceof Error
              ? `${topic.topic}: ${result.reason.message}`
              : `${topic.topic}: Unable to load YouTube tutorial.`
          );
        });

        setYoutubeError(
          failures.length > 0
            ? `Some YouTube tutorials could not be loaded. ${failures.join(" ")}`
            : null
        );
        const freshVideos: Record<string, YouTubeVideo[]> = {};
        settledResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            freshVideos[uniqueMissingTopics[index].topicCacheKey] =
              result.value.videos;
          }
        });
        backfillVideoCache(freshVideos);
        setVideos((currentValue) => ({
          ...currentValue,
          ...Object.fromEntries(
            topicEntries.map((entry) => [
              entry.key,
              fetchedTopicsRef.current[entry.topicCacheKey] ?? [],
            ])
          ),
        }));
        setLoadingTopics((currentValue) => ({
          ...currentValue,
          ...Object.fromEntries(
            uniqueMissingTopics.map((entry) => [entry.key, false])
          ),
        }));
      });

    return () => {
      isMounted = false;
      uniqueMissingTopics.forEach((entry) => {
        requestedTopicsRef.current.delete(entry.topicCacheKey);
      });
    };
  }, [planKey, topicEntries, roadmapParam]);

  if (isRestoring) {
    return (
      <div className="py-16 text-center text-sm font-semibold text-slate-500">
        Restoring your saved roadmap...
      </div>
    );
  }

  if (restoreError) {
    return (
      <div className="space-y-6">
        <div
          className="rounded-[20px] border border-rose-200 bg-rose-50/80 p-4 text-sm font-semibold leading-6 text-rose-700"
          role="alert"
        >
          {restoreError}
        </div>
        <EmptyPlan />
      </div>
    );
  }

  if (!plan) {
    return <EmptyPlan />;
  }

  const filteredPhases = filterPhases(plan.phases, searchQuery);
  const visibleTopicCount = filteredPhases.reduce(
    (total, phase) => total + phase.recommended_topics.length,
    0
  );

  return (
    <div className="space-y-6">
      <PlanHeader plan={plan} />

      <div className="flex justify-end">
        <Button onClick={handleRefreshResources} size="large" variant="secondary">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh resources
        </Button>
      </div>

      {youtubeError ? (
        <section className="rounded-[20px] border border-amber-200 bg-amber-50/80 p-4 text-sm font-semibold leading-6 text-amber-800">
          {youtubeError}
        </section>
      ) : null}

      {plan.final_milestone ? (
        <section className="metric-card p-5">
          <div className="flex gap-3">
            <span className="glass-control inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-blue-600">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-black text-slate-500">
                Final Milestone
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                {plan.final_milestone}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <PhaseTimeline
        completedTopics={state.completedTopics}
        loadingTopics={loadingTopics}
        onToggleTopic={toggleTopicCompletion}
        phases={filteredPhases}
        searchQuery={searchQuery}
        visibleTopicCount={visibleTopicCount}
        videos={videos}
      />
    </div>
  );
}

function getTopicCacheKey(topic: string): string {
  return topic.trim().toLowerCase();
}

function filterPhases(phases: LearningPhase[], query: string): LearningPhase[] {
  const queryTokens = normalizeSearchText(query).split(" ").filter(Boolean);

  if (queryTokens.length === 0) {
    return phases;
  }

  return phases
    .map((phase) => {
      const phaseSearchText = normalizeSearchText(
        [
          phase.title,
          phase.objective,
          phase.estimated_duration,
          ...phase.milestones,
          ...phase.suggested_resource_categories,
        ].join(" ")
      );
      const phaseMatches = matchesSearchTokens(phaseSearchText, queryTokens);
      const matchingTopics = phase.recommended_topics.filter((topic) => {
        const topicSearchText = normalizeSearchText(
          [
            topic,
            phase.title,
            phase.objective,
            ...phase.milestones,
            ...phase.suggested_resource_categories,
          ].join(" ")
        );

        return matchesSearchTokens(topicSearchText, queryTokens);
      });

      if (!phaseMatches && matchingTopics.length === 0) {
        return null;
      }

      return {
        ...phase,
        recommended_topics: phaseMatches ? phase.recommended_topics : matchingTopics,
      };
    })
    .filter((phase): phase is LearningPhase => phase !== null);
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesSearchTokens(searchText: string, queryTokens: string[]): boolean {
  return queryTokens.every((token) => searchText.includes(token));
}
