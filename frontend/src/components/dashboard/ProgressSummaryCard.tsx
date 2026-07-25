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
    <section className="rounded-md border border-white/[0.08] bg-[#1A2235] p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,420px)] lg:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-violet-500 text-white">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-bold text-white">Progress Summary</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              {summary ??
                `${completedTopics} of ${totalTopics} roadmap topics completed.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="w-10 text-right text-sm font-bold text-white">
            {normalizedPercentage}%
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
              style={{ width: `${normalizedPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
