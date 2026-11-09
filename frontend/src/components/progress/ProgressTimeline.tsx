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
    <section className="l-card flex flex-1 flex-col p-5">
      <p className="l-readout flex items-center gap-2">
        <ListChecks className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        learning journey
      </p>
      <h2 className="mt-2">Progress Timeline</h2>
      <ol className="mt-5 flex-1 space-y-3">
        {entries.map((entry) => (
          <li
            className="l-well flex items-start gap-3 p-3"
            key={`${entry.status}-${entry.label}`}
          >
            <TimelineIcon status={entry.status} />
            <p className="text-sm leading-6 text-ink-2">
              {entry.label}
            </p>
          </li>
        ))}
      </ol>
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
        className="mt-0.5 h-5 w-5 shrink-0 text-success"
        aria-hidden="true"
      />
    );
  }

  if (status === "current") {
    return (
      <Clock3
        className="mt-0.5 h-5 w-5 shrink-0 text-accent"
        aria-hidden="true"
      />
    );
  }

  return (
    <Circle
      className="mt-0.5 h-5 w-5 shrink-0 text-muted"
      aria-hidden="true"
    />
  );
}
