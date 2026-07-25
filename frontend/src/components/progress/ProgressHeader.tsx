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
    <section className="rounded-md border border-white/[0.08] bg-[linear-gradient(120deg,#1A2235,rgba(30,41,59,0.82))] p-6 shadow-sm sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-violet-500 text-white">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            Learning Progress
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
            Study tracking overview
          </h1>
          {goal ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {goal}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            to="/learning-plan"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Learning Plan
          </Link>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            to="/dashboard"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
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
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
