import { Activity } from "lucide-react";

type ProgressOverviewProps = {
  completionPercentage: number;
  currentPhase: number;
  learnerStatus: string;
  summary: string;
};

export function ProgressOverview({
  completionPercentage,
  currentPhase,
  learnerStatus,
  summary,
}: ProgressOverviewProps) {
  const boundedCompletion = Math.min(Math.max(completionPercentage, 0), 100);

  return (
    <section className="l-card p-5 sm:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="l-readout flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            progress summary
          </p>
          <h2 className="mt-1">
            Phase {currentPhase} - {learnerStatus}
          </h2>
          <p className="l-caption mt-3 max-w-2xl leading-6">
            {summary}
          </p>
        </div>
        <div className="l-well min-w-36 shrink-0 p-4">
          <p className="l-readout">completion</p>
          <p className="font-outlier mt-2 text-3xl text-ink">
            {boundedCompletion}%
          </p>
        </div>
      </div>
      <span className="l-meter mt-5 block">
        <span
          className="l-meter-fill"
          style={{ width: `${boundedCompletion}%` }}
        />
      </span>
    </section>
  );
}
