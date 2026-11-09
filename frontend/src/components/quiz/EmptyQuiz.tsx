import { ArrowRight, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function EmptyQuiz() {
  return (
    <section className="l-card mx-auto mt-6 flex max-w-2xl flex-col items-center p-8 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full border border-rule bg-paper">
        <ClipboardCheck className="h-6 w-6 text-muted" aria-hidden="true" />
      </div>
      <h1 className="mt-5">Generate a learning plan first</h1>
      <p className="l-caption mt-3 leading-6">
        Saarthi uses the topics in your current roadmap to create a focused
        quiz. Complete onboarding to generate a learning plan.
      </p>
      <Link className="l-pill l-pill-primary mt-6" to="/onboarding">
        Create Learning Plan
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
