import { ArrowLeft, LayoutDashboard, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

type ProgressHeaderProps = {
  currentStage: string | null;
  goal: string | null;
  subject: string | null;
  workflowCompleted: boolean;
};

export function ProgressHeader({
  currentStage,
  goal,
  subject,
  workflowCompleted,
}: ProgressHeaderProps) {
  return (
    <section className="l-enter pt-4">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="l-readout flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            learning progress
          </p>
          <h1 className="mt-2">Study Tracking Overview</h1>
          {goal ? (
            <p className="mt-3 max-w-3xl leading-7 text-ink-2">
              {goal}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link className="l-pill l-pill-ghost" to="/learning-plan">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Learning Plan
            </Link>
            <Link className="l-pill l-pill-primary" to="/dashboard">
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatusMeta label="Subject" value={subject} />
        <StatusMeta label="Current Stage" value={currentStage} />
        <StatusMeta
          label="Workflow Status"
          value={workflowCompleted ? "Completed" : "In progress"}
        />
      </div>
    </section>
  );
}

type StatusMetaProps = {
  label: string;
  value: string | null;
};

function StatusMeta({ label, value }: StatusMetaProps) {
  if (!value) {
    return null;
  }

  return (
    <div className="l-well p-3">
      <p className="l-readout">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
