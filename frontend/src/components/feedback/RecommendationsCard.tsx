import { ListChecks } from "lucide-react";

type RecommendationsCardProps = {
  recommendations: string[];
};

export function RecommendationsCard({
  recommendations,
}: RecommendationsCardProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="h-full rounded-md border border-white/[0.08] bg-[#1A2235] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-white/[0.14] sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-sky-500 to-blue-500 text-white">
          <ListChecks className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-base font-semibold text-slate-950">
          Recommendations
        </h2>
      </div>
      <div className="space-y-3">
        {recommendations.map((recommendation) => (
          <p
            className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700"
            key={recommendation}
          >
            {recommendation}
          </p>
        ))}
      </div>
    </section>
  );
}
