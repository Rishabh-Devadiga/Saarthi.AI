import { Check } from "lucide-react";

import { StepHeader } from "@/components/onboarding/StepHeader";
import type { LearningPreference } from "@/components/onboarding/types";
import { cn } from "@/utils/cn";

const preferences: Array<{
  description: string;
  value: LearningPreference;
}> = [
  {
    value: "Videos",
    description: "Visual explanations and guided walkthroughs",
  },
  {
    value: "Articles",
    description: "Detailed reading and reference material",
  },
  {
    value: "Hands-on Projects",
    description: "Practical work that turns concepts into skills",
  },
  {
    value: "Quizzes",
    description: "Quick checks to reinforce understanding",
  },
  {
    value: "Flashcards",
    description: "Short-form revision for important concepts",
  },
];

type PreferencesStepProps = {
  error: string | null;
  onToggle: (preference: LearningPreference) => void;
  values: LearningPreference[];
};

export function PreferencesStep({
  error,
  onToggle,
  values,
}: PreferencesStepProps) {
  return (
    <div>
      <StepHeader
        description="Select every format that helps you stay engaged. Saarthi will include these preferences in your learning profile."
        title="How do you prefer to learn?"
      />

      <div
        aria-describedby={error ? "preferences-error" : undefined}
        aria-label="Learning preferences"
        className="mt-8 grid gap-3 sm:grid-cols-2"
        role="group"
      >
        {preferences.map((preference, index) => {
          const isSelected = values.includes(preference.value);

          return (
            <button
              aria-pressed={isSelected}
              className={cn("l-choice flex min-h-20 items-start gap-4 p-4 text-left", isSelected && "is-selected")}
              key={preference.value}
              onClick={() => onToggle(preference.value)}
              type="button"
            >
              <span className="l-readout pt-0.5">{`0${index + 1}`}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-ink">
                  {preference.value}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted">
                  {preference.description}
                </span>
              </span>
              {isSelected ? (
                <Check
                  className="h-4 w-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="l-field-note mt-3" id="preferences-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
