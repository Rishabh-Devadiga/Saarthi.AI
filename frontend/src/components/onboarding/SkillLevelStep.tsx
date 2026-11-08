import { Check } from "lucide-react";

import { StepHeader } from "@/components/onboarding/StepHeader";
import type { SkillLevel } from "@/components/onboarding/types";
import { cn } from "@/utils/cn";

const skillLevels: Array<{
  description: string;
  value: SkillLevel;
}> = [
  {
    value: "Beginner",
    description: "I am new to this topic or have only explored the basics.",
  },
  {
    value: "Intermediate",
    description: "I understand the fundamentals and have some practical experience.",
  },
  {
    value: "Advanced",
    description: "I am comfortable with the topic and want deeper mastery.",
  },
];

type SkillLevelStepProps = {
  error: string | null;
  onChange: (skillLevel: SkillLevel) => void;
  value: SkillLevel | "";
};

export function SkillLevelStep({
  error,
  onChange,
  value,
}: SkillLevelStepProps) {
  return (
    <div>
      <StepHeader
        description="Your starting point helps Saarthi choose the right depth, pacing, and sequence."
        title="Where Are You Starting From?"
      />

      <div
        aria-describedby={error ? "skill-error" : undefined}
        aria-label="Current skill level"
        className="mt-8 grid gap-3 md:grid-cols-3"
        role="radiogroup"
      >
        {skillLevels.map((level, index) => {
          const isSelected = value === level.value;

          return (
            <button
              aria-checked={isSelected}
              className={cn("l-choice min-h-40 p-5 text-left", isSelected && "is-selected")}
              key={level.value}
              onClick={() => onChange(level.value)}
              role="radio"
              type="button"
            >
              <span className="l-readout">{`0${index + 1}`}</span>
              <span className="mt-4 block text-lg text-ink">{level.value}</span>
              <span className="mt-1.5 block text-sm leading-6 text-muted">
                {level.description}
              </span>
              {isSelected ? (
                <Check
                  className="absolute right-4 top-4 h-4 w-4 text-accent"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="l-field-note mt-3" id="skill-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
