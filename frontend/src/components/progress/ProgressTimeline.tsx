import { CheckCircle2, Circle, Clock3, ListChecks } from "lucide-react";

export type ProgressTimelineEntry = {
  label: string;
  status: "completed" | "current" | "upcoming";
};

type ProgressTimelineProps = {
  entries: ProgressTimelineEntry[];
};

export function ProgressTimeline({ entries }: ProgressTimelineProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-1 flex-col rounded-md border border-white/[0.08] bg-[#1A2235] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-white/[0.14] sm:p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-blue-500 text-white">
          <ListChecks className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Learning Journey
          </p>
          <h2 className="mt-0.5 text-lg font-bold tracking-normal text-slate-950">
            Progress Timeline
          </h2>
        </div>
      </div>
      <div className="mt-5 flex-1 space-y-3">
        {entries.map((entry) => (
          <div
            className="flex items-start gap-3 rounded-md bg-slate-50 p-3"
            key={`${entry.status}-${entry.label}`}
          >
            <TimelineIcon status={entry.status} />
            <p className="text-sm font-medium leading-6 text-slate-700">
              {entry.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

type TimelineIconProps = {
  status: ProgressTimelineEntry["status"];
};

function TimelineIcon({ status }: TimelineIconProps) {
  if (status === "completed") {
    return (
      <CheckCircle2
        className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
        aria-hidden="true"
      />
    );
  }

  if (status === "current") {
    return (
      <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
    );
  }

  return (
    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
  );
}
