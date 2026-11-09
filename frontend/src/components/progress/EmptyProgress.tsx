import { ArrowRight, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export function EmptyProgress() {
  return (
    <section className="l-card mx-auto mt-6 flex max-w-2xl flex-col items-center p-8 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full border border-rule bg-paper">
        <BarChart3 className="h-6 w-6 text-muted" aria-hidden="true" />
      </div>
      <h1 className="mt-5">No progress recorded yet</h1>
      <p className="l-caption mt-3 leading-6">
        Start a learning session in chat. Once the workflow produces a progress
        report, your completion metrics and next action will appear here.
      </p>
      <Link className="l-pill l-pill-primary mt-6" to="/chat">
        Start Learning Session
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
