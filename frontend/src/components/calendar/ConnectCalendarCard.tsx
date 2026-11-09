import { CalendarDays, ExternalLink } from "lucide-react";

import { CalendarActions } from "@/components/calendar/CalendarActions";
import { CalendarStatus } from "@/components/calendar/CalendarStatus";
import type { StudyScheduleEvent } from "@/types/calendar";

type ConnectCalendarCardProps = {
  connected: boolean;
  disabled: boolean;
  isBusy: boolean;
  onConnect: () => void;
  onGenerateSchedule: () => void;
  upcomingStudySession: StudyScheduleEvent | null;
};

export function ConnectCalendarCard({
  connected,
  disabled,
  isBusy,
  onConnect,
  onGenerateSchedule,
  upcomingStudySession,
}: ConnectCalendarCardProps) {
  return (
    <section className="l-card flex h-full flex-col p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-rule bg-paper">
          <CalendarDays className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
        </span>
        <div>
          <p className="l-readout">study schedule</p>
          <h2 className="mt-1">Google Calendar</h2>
          <CalendarStatus connected={connected} />
        </div>
      </div>

      {upcomingStudySession ? (
        <div className="l-well mt-4 p-4">
          <p className="l-readout">upcoming study session</p>
          <p className="mt-2 font-medium text-ink">
            {formatRelativeDate(upcomingStudySession.start)}
          </p>
          <p className="l-caption mt-1">
            {formatTime(upcomingStudySession.start)} - {upcomingStudySession.topic}
          </p>
          <a
            className="mt-3 inline-flex items-center gap-2 text-sm text-accent underline-offset-4 hover:underline"
            href="https://calendar.google.com/calendar/u/0/r"
            rel="noreferrer"
            target="_blank"
          >
            Open Google Calendar
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      ) : null}

      <div className="mt-auto pt-4">
        <CalendarActions
          connected={connected}
          disabled={disabled}
          isBusy={isBusy}
          onConnect={onConnect}
          onGenerateSchedule={onGenerateSchedule}
        />
      </div>
    </section>
  );
}

function formatRelativeDate(value: string): string {
  const eventDate = new Date(value);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (eventDate.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(eventDate);
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
