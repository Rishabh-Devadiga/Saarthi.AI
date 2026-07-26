import { PhaseCard } from "@/components/learning-plan/PhaseCard";
import type { YouTubeVideo } from "@/services/youtubeService";
import type { LearningPhase } from "@/types/learning";

type PhaseTimelineProps = {
  completedTopics: Record<string, boolean>;
  loadingTopics: Record<string, boolean>;
  onToggleTopic: (phaseNumber: number, topic: string, completed: boolean) => void;
  phases: LearningPhase[];
  videos: Record<string, YouTubeVideo[]>;
};

export function PhaseTimeline({
  completedTopics,
  loadingTopics,
  onToggleTopic,
  phases,
  videos,
}: PhaseTimelineProps) {
  if (phases.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-slate-500">Roadmap</p>
        <h2 className="mt-1 text-xl font-bold tracking-normal text-slate-950">
          Learning Phases
        </h2>
      </div>
      <div className="grid gap-4">
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
    </section>
  );
}
