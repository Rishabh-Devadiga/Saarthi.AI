import { CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { EmptyPlan } from "@/components/learning-plan/EmptyPlan";
import { PhaseTimeline } from "@/components/learning-plan/PhaseTimeline";
import { PlanHeader } from "@/components/learning-plan/PlanHeader";
import { useSession } from "@/context/SessionContext";
import {
  searchYouTubeTutorials,
  YouTubeSearchError,
  type YouTubeVideo,
} from "@/services/youtubeService";
import { getTopicKey } from "@/utils/learningPlan";

export function LearningPlanPage() {
  const { state, toggleTopicCompletion } = useSession();
  const plan = state.learningPlan;
  const [videos, setVideos] = useState<Record<string, YouTubeVideo[]>>({});
  const [loadingTopics, setLoadingTopics] = useState<Record<string, boolean>>({});
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const fetchedTopicsRef = useRef<Record<string, YouTubeVideo[]>>({});
  const requestedTopicsRef = useRef<Set<string>>(new Set());
  const activePlanKeyRef = useRef<string | null>(null);
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

  useEffect(() => {
    let isMounted = true;

    if (!planKey) {
      return;
    }

    if (activePlanKeyRef.current !== planKey) {
      activePlanKeyRef.current = planKey;
      requestedTopicsRef.current = new Set();
      fetchedTopicsRef.current = {};
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
  }, [planKey, topicEntries]);

  if (!plan) {
    return <EmptyPlan />;
  }

  return (
    <div className="space-y-6">
      <PlanHeader plan={plan} />

      {youtubeError ? (
        <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          {youtubeError}
        </section>
      ) : null}

      {plan.final_milestone ? (
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Final Milestone
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
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
        phases={plan.phases}
        videos={videos}
      />
    </div>
  );
}

function getTopicCacheKey(topic: string): string {
  return topic.trim().toLowerCase();
}
