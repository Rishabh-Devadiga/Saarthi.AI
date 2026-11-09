import { ArrowRight, Map } from "lucide-react";
import { Link } from "react-router-dom";

export function EmptyPlan() {
  return (
    <section className="l-well mx-auto flex max-w-2xl flex-col items-center p-8 text-center sm:p-12">
      <span className="flex h-11 w-11 items-center justify-center border border-rule text-accent">
        <Map className="h-5 w-5" aria-hidden="true" />
      </span>
      <h1 className="mt-6">No Learning Plan Yet</h1>
      <p className="mt-3 text-sm leading-6 text-ink-2">
        Start a learning session in chat to generate a personalized roadmap.
        Once the planner returns a plan, it will appear here automatically.
      </p>
      <Link className="l-pill l-pill-primary mt-7" to="/chat">
        Generate Learning Plan
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
