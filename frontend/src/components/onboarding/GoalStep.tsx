import { Check } from "lucide-react";

import { StepHeader } from "@/components/onboarding/StepHeader";
import { cn } from "@/utils/cn";

const quickGoals = [
  { label: "Become a Data Scientist" },
  { label: "Crack AWS Solutions Architect" },
  { label: "Learn Full Stack Development" },
  { label: "Master Data Analytics" },
  { label: "Prepare for GATE CSE" },
];

type GoalStepProps = {
  error: string | null;
  onChange: (goal: string) => void;
  value: string;
};

export function GoalStep({ error, onChange, value }: GoalStepProps) {
  const selectedQuickGoal = quickGoals.some((goal) => goal.label === value);
  const customGoal = selectedQuickGoal ? "" : value;

  return (
    <div>
      <StepHeader
        description="Choose a popular path or describe the outcome you want Saarthi.AI to help you reach."
        title="What Do You Want to Learn?"
      />

      <div
        aria-label="Quick learning goals"
        className="mt-8 grid gap-3 sm:grid-cols-2"
        role="radiogroup"
      >
        {quickGoals.map((goal, index) => {
          const isSelected = value === goal.label;
          const isLast = index === quickGoals.length - 1;

          return (
            <button
              aria-checked={isSelected}
              className={cn("l-choice flex min-h-13 items-center gap-4 px-4 py-3 text-left text-sm", isSelected && "is-selected", isLast && "sm:col-span-2")}
              key={goal.label}
              onClick={() => onChange(goal.label)}
              role="radio"
              type="button"
            >
              <span className="l-readout shrink-0">{`0${index + 1}`}</span>
              <span className="min-w-0 flex-1">{goal.label}</span>
              {isSelected ? (
                <Check className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="my-7 flex items-center gap-3">
        <span aria-hidden="true" className="h-px flex-1 bg-rule" />
        <span className="l-readout">or enter a custom goal</span>
        <span aria-hidden="true" className="h-px flex-1 bg-rule" />
      </div>

      <label className="block text-sm text-ink-2" htmlFor="custom-goal">
        Custom learning goal
      </label>
      <input
        aria-describedby={error ? "goal-error" : undefined}
        aria-invalid={Boolean(error)}
        className="l-field mt-2 text-base"
        id="custom-goal"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Example: Learn product design for a career switch"
        type="text"
        value={customGoal}
      />
      {error ? (
        <p className="l-field-note mt-2" id="goal-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
