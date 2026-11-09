import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

type NextActionCardProps = {
  nextAction: string | null;
};

export function NextActionCard({ nextAction }: NextActionCardProps) {
  if (!nextAction) {
    return null;
  }

  return (
    <section className="l-card p-5">
      <p className="l-readout flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        next recommended action
      </p>
      <h2 className="mt-2">{nextAction}</h2>
      <Link
        className="l-pill l-pill-ghost mt-5 h-11 px-4 text-sm"
        to="/learning-plan"
      >
        Review Roadmap
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
