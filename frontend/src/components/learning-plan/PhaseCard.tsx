import { CalendarDays, Clock } from "lucide-react";

import { MilestoneCard } from "@/components/learning-plan/MilestoneCard";
import { PhaseProgress } from "@/components/learning-plan/PhaseProgress";
import { ResourceList } from "@/components/learning-plan/ResourceList";
import { TopicChecklist } from "@/components/learning-plan/TopicChecklist";
import type { YouTubeVideo } from "@/services/youtubeService";
import type { LearningPhase } from "@/types/learning";
import { getTopicKey } from "@/utils/learningPlan";

type PhaseCardProps = {
  completedTopics: Record<string, boolean>;
  loadingTopics: Record<string, boolean>;
  onToggleTopic: (phaseNumber: number, topic: string, completed: boolean) => void;
  phase: LearningPhase;
  videos: Record<string, YouTubeVideo[]>;
};

export function PhaseCard({
  completedTopics,
  loadingTopics,
  onToggleTopic,
  phase,
  videos,
}: PhaseCardProps) {
  const completedTopicCount = phase.recommended_topics.filter(
    (topic) => completedTopics[getTopicKey(phase.phase_number, topic)]
  ).length;
  const isDone =
    phase.recommended_topics.length > 0 &&
    completedTopicCount === phase.recommended_topics.length;

  return (
    <article className="l-well p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className="l-tag">
            phase {String(phase.phase_number).padStart(2, "0")}
            {isDone ? (
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-accent"
              />
            ) : null}
          </span>
          <h3 className="mt-3 text-lg sm:text-xl">{phase.title}</h3>
          <p className="mt-2 text-sm leading-6 text-ink-2">{phase.objective}</p>
        </div>
        {phase.estimated_duration ? (
          <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
            <span className="l-tag">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {phase.estimated_duration}
            </span>
            {phase.start_date && phase.end_date ? (
              <span className="l-readout">
                <CalendarDays className="mr-1 inline-block h-3.5 w-3.5" aria-hidden="true" />
                {formatPhaseDate(phase.start_date)} - {formatPhaseDate(phase.end_date)}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        <PhaseProgress
          completedCount={completedTopicCount}
          totalCount={phase.recommended_topics.length}
        />
      </div>

      <TopicChecklist
        completedTopics={completedTopics}
        loadingTopics={loadingTopics}
        onToggleTopic={onToggleTopic}
        phaseNumber={phase.phase_number}
        topics={phase.recommended_topics}
        videos={videos}
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <MilestoneCard milestones={phase.milestones} />
        <ResourceList resources={phase.suggested_resource_categories} />
      </div>
    </article>
  );
}

function formatPhaseDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
