import { PhaseCard } from "@/components/learning-plan/PhaseCard";
import type { YouTubeVideo } from "@/services/youtubeService";
import type { LearningPhase } from "@/types/learning";

type PhaseTimelineProps = {
  completedTopics: Record<string, boolean>;
  loadingTopics: Record<string, boolean>;
  onToggleTopic: (phaseNumber: number, topic: string, completed: boolean) => void;
  phases: LearningPhase[];
  searchQuery?: string;
  visibleTopicCount?: number;
  videos: Record<string, YouTubeVideo[]>;
};

export function PhaseTimeline({
  completedTopics,
  loadingTopics,
  onToggleTopic,
  phases,
  searchQuery = "",
  visibleTopicCount = 0,
  videos,
}: PhaseTimelineProps) {
  const isSearching = searchQuery.trim().length > 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="l-readout">roadmap</p>
          <h2 className="mt-1">Learning Phases</h2>
        </div>
        {isSearching ? (
          <p className="l-readout" aria-live="polite">
            {visibleTopicCount > 0
              ? `${visibleTopicCount} ${visibleTopicCount === 1 ? "topic" : "topics"} found for "${searchQuery}"`
              : `no topics found for "${searchQuery}"`}
          </p>
        ) : null}
      </div>
      {phases.length > 0 ? (
        <div className="grid gap-5">
          {phases
            .slice()
            .sort((first, second) => first.phase_number - second.phase_number)
            .map((phase) => (
              <PhaseCard
                completedTopics={completedTopics}
                key={`${phase.phase_number}-${phase.title}`}
                loadingTopics={loadingTopics}
                onToggleTopic={onToggleTopic}
                phase={phase}
                videos={videos}
              />
            ))}
        </div>
      ) : (
        <div className="l-well p-6 text-center">
          <p className="text-sm text-ink-2">No matches found</p>
          <p className="mt-2 text-sm text-muted">
            Try a topic, phase name, milestone, or resource type from your
            roadmap.
          </p>
        </div>
      )}
    </section>
  );
}
