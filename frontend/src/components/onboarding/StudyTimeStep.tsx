import { Clock3 } from "lucide-react";

import { formatStudyTime } from "@/components/onboarding/formatters";
import { StepHeader } from "@/components/onboarding/StepHeader";

type StudyTimeStepProps = {
  onChange: (studyHours: number) => void;
  value: number;
};

export function StudyTimeStep({ onChange, value }: StudyTimeStepProps) {
  const percentage = ((value - 0.5) / 5.5) * 100;

  return (
    <div>
      <StepHeader
        description="Choose a sustainable daily commitment. Saarthi will shape the roadmap around the time you can consistently protect."
        title="How much time can you commit?"
      />

      <div className="l-well mt-8 p-5 sm:p-7">
        <div className="text-center" aria-live="polite">
          <p className="font-[family-name:var(--font-outlier)] text-4xl text-ink sm:text-5xl">
            {formatStudyTime(value)}
          </p>
          <p className="l-caption mt-2">every day</p>
        </div>

        <label className="sr-only" htmlFor="study-time">
          Daily study time
        </label>
        <input
          className="onboarding-range mt-10 w-full"
          id="study-time"
          max="6"
          min="0.5"
          onChange={(event) => onChange(Number(event.target.value))}
          step="0.5"
          style={{ "--range-progress": `${percentage}%` } as React.CSSProperties}
          type="range"
          value={value}
        />
        <div className="l-readout mt-3 flex justify-between">
          <span>30 mins</span>
          <span>6 hours</span>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3">
        <Clock3
          className="mt-0.5 h-4 w-4 shrink-0 text-muted"
          aria-hidden="true"
        />
        <p className="text-sm leading-6 text-ink-2">
          Consistency matters more than choosing the largest number. Pick a
          pace you can maintain.
        </p>
      </div>
    </div>
  );
}
