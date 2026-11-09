import { Clock } from "lucide-react";

import type { StudyScheduleEvent } from "@/types/calendar";

type ScheduleEventCardProps = {
  event: StudyScheduleEvent;
};

export function ScheduleEventCard({ event }: ScheduleEventCardProps) {
  return (
    <article className="l-well p-4">
      <p className="font-medium text-ink">{event.topic}</p>
      <p className="l-caption mt-1">{event.phase}</p>
      <div className="l-readout mt-3 flex flex-wrap gap-x-3 gap-y-1">
        <span>{formatDate(event.start)}</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
          {formatTime(event.start)} - {formatTime(event.end)}
        </span>
        <span>{event.durationMinutes} min</span>
      </div>
    </article>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
