import { TrendingUp } from "lucide-react";

type ProgressSummaryCardProps = {
  completedTopics: number;
  percentage: number;
  summary: string | null;
  totalTopics: number;
};

export function ProgressSummaryCard({
  completedTopics,
  percentage,
  summary,
  totalTopics,
}: ProgressSummaryCardProps) {
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <section className="l-card p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(240px,420px)] lg:items-center">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-rule bg-paper">
            <TrendingUp className="h-5 w-5 text-accent" aria-hidden="true" />
          </span>
          <div>
            <p className="l-readout">progress so far</p>
            <h2 className="mt-1">Progress Summary</h2>
            <p className="l-caption mt-2 leading-6">
              {summary ??
                `${completedTopics} of ${totalTopics} roadmap topics completed.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-outlier w-12 shrink-0 text-right text-lg text-ink">
            {normalizedPercentage}%
          </span>
          <span className="l-meter flex-1">
            <span
              className="l-meter-fill"
              style={{ width: `${normalizedPercentage}%` }}
            />
          </span>
        </div>
      </div>
    </section>
  );
}
