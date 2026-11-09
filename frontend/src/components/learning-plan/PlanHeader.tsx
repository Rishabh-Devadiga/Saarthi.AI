import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { LearningPlan } from "@/types/learning";

type PlanHeaderProps = {
  plan: LearningPlan;
};

export function PlanHeader({ plan }: PlanHeaderProps) {
  return (
    <section className="l-well p-5 sm:p-7">
      <p className="l-readout">the plan</p>
      <h1 className="mt-3">{plan.learning_goal}</h1>
      {plan.overview ? (
        <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-2">
          {plan.overview}
        </p>
      ) : null}

      <div className="mt-7 grid gap-4 border-t border-rule pt-5 sm:grid-cols-2 lg:grid-cols-4">
        <PlanMeta label="subject" value={plan.subject} />
        <PlanMeta label="skill level" value={plan.learner_level} />
        <PlanMeta
          label="target completion"
          value={formatDeadline(plan.target_deadline)}
        />
        <PlanMeta
          label="daily study time"
          value={plan.total_available_time}
        />
      </div>

      <div className="mt-7 flex flex-col gap-3 border-t border-rule pt-5 sm:flex-row">
        <Link className="l-pill l-pill-ghost sm:h-10" to="/dashboard">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
        <Link className="l-pill l-pill-primary sm:h-10" to="/progress">
          Continue to Progress
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

type PlanMetaProps = {
  label: string;
  value: string | null;
};

function PlanMeta({ label, value }: PlanMetaProps) {
  if (!value) {
    return null;
  }

  return (
    <div className="min-w-0">
      <p className="l-readout">{label}</p>
      <p className="mt-1 text-sm text-ink">{value}</p>
    </div>
  );
}

function formatDeadline(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
}
