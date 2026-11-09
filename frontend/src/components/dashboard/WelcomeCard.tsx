import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

type WelcomeCardProps = {
  learnerName: string | null;
  learningGoal: string | null;
  subject: string | null;
};

export function WelcomeCard({
  learnerName,
  learningGoal,
  subject,
}: WelcomeCardProps) {
  return (
    <section className="l-enter pt-4">
      <p className="l-readout">active workspace</p>
      <h1 className="mt-2">Welcome{learnerName ? `, ${learnerName}` : ""}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-ink-2">
        {learningGoal ??
          "Build a roadmap from chat, then track study goals, feedback, nudges, and schedules here."}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link className="l-pill l-pill-primary" to="/learning-plan">
          Learning Plan
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link className="l-pill l-pill-ghost" to="/progress">
          Progress
        </Link>
        {subject ? <span className="l-tag">{subject}</span> : null}
      </div>
    </section>
  );
}
