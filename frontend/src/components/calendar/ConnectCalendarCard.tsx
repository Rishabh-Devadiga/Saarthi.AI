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
    <section className="flex h-full flex-col rounded-md border border-white/[0.08] bg-[#1A2235] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-white/[0.14]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-violet-500 text-white">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Google Calendar
            </h2>
            <CalendarStatus connected={connected} />
          </div>
        </div>
      </div>

      {upcomingStudySession ? (
        <div className="mb-4 rounded-md bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Upcoming Study Session
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatRelativeDate(upcomingStudySession.start)}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {formatTime(upcomingStudySession.start)} - {upcomingStudySession.topic}
          </p>
          <a
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline"
            href="https://calendar.google.com/calendar/u/0/r"
            rel="noreferrer"
            target="_blank"
          >
            Open Google Calendar
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      ) : null}

      <div className="mt-auto">
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
