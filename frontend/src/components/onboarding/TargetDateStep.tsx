import { CalendarDays, Route } from "lucide-react";

import { StepHeader } from "@/components/onboarding/StepHeader";

type TargetDateStepProps = {
  error: string | null;
  minDate: string;
  onChange: (targetDate: string) => void;
  value: string;
};

export function TargetDateStep({
  error,
  minDate,
  onChange,
  value,
}: TargetDateStepProps) {
  return (
    <div>
      <StepHeader
        description="Set the date you want to reach your goal. You can adjust your pace later as your learning journey evolves."
        title="What are you working toward?"
      />

      <div className="mt-8">
        <label className="block text-sm text-ink-2" htmlFor="target-date">
          Target completion date
        </label>
        <div className="relative mt-2">
          <CalendarDays
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            aria-describedby={error ? "date-error date-helper" : "date-helper"}
            aria-invalid={Boolean(error)}
            className="onboarding-date l-field pl-11 text-base"
            id="target-date"
            min={minDate}
            onChange={(event) => onChange(event.target.value)}
            type="date"
            value={value}
          />
        </div>
        {error ? (
          <p className="l-field-note mt-2" id="date-error">
            {error}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex items-start gap-3">
        <Route
          className="mt-0.5 h-4 w-4 shrink-0 text-muted"
          aria-hidden="true"
        />
        <p
          className="text-sm leading-6 text-ink-2"
          id="date-helper"
        >
          Saarthi will use this deadline and your daily study time to
          personalize the number, pacing, and duration of roadmap phases.
        </p>
      </div>
    </div>
  );
}
