import { X } from "lucide-react";

import { ScheduleEventCard } from "@/components/calendar/ScheduleEventCard";
import type { StudyScheduleEvent } from "@/types/calendar";

type SchedulePreviewProps = {
  events: StudyScheduleEvent[];
  isCreating: boolean;
  onCancel: () => void;
  onCreate: () => void;
};

export function SchedulePreview({
  events,
  isCreating,
  onCancel,
  onCreate,
}: SchedulePreviewProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[color-mix(in_oklab,var(--color-paper)_62%,black)] p-4">
      <section className="l-card l-enter max-h-[90vh] w-full max-w-3xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-rule p-5">
          <div>
            <p className="l-readout">schedule preview</p>
            <h2 className="mt-1">Review Schedule</h2>
            <p className="l-caption mt-2">
              {events.length} study sessions will be added to your primary
              calendar.
            </p>
          </div>
          <button
            aria-label="Close schedule preview"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-rule text-muted"
            onClick={onCancel}
            type="button"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto border-b border-rule bg-paper-2 p-5">
          {events.map((event) => (
            <ScheduleEventCard event={event} key={event.id} />
          ))}
        </div>
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:justify-end">
          <button
            className="l-pill l-pill-ghost px-5"
            disabled={isCreating}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="l-pill l-pill-primary px-5"
            disabled={isCreating}
            onClick={onCreate}
            type="button"
          >
            {isCreating ? "Creating events…" : "Create Calendar Events"}
          </button>
        </div>
      </section>
    </div>
  );
}
