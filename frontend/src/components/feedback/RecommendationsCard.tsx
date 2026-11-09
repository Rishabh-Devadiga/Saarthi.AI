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
    <section className="l-card h-full p-5 sm:p-6">
      <p className="l-readout flex items-center gap-2">
        <ListChecks className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        study plan
      </p>
      <h2 className="mt-2">Recommendations</h2>
      <div className="mt-4 space-y-3">
        {recommendations.map((recommendation) => (
          <p
            className="l-well p-3 text-sm leading-6 text-ink-2"
            key={recommendation}
          >
            {recommendation}
          </p>
        ))}
      </div>
    </section>
  );
}
