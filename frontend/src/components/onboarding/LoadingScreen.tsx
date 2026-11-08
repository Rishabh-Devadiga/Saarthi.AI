import { Check, Circle, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { formatStudyTime, formatTargetDate } from "@/components/onboarding/formatters";
import type { OnboardingFormState } from "@/components/onboarding/types";
import { cn } from "@/utils/cn";

const loadingStages = [
  "Understanding your learning goal…",
  "Building your personalized roadmap…",
  "Tracking milestones…",
  "Preparing AI feedback…",
  "Almost ready…",
];

type LoadingScreenProps = {
  formState: OnboardingFormState;
};

/**
 * The signature moment: the five answers read back in mono inside one
 * well — the same path the landing hero draws — while the stages tick
 * beneath a hairline. The interval and stage copy are kept as they were.
 */
export function LoadingScreen({ formState }: LoadingScreenProps) {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStage((current) =>
        Math.min(current + 1, loadingStages.length - 1)
      );
    }, 1800);

    return () => window.clearInterval(interval);
  }, []);

  const answers = [
    { label: "goal", value: formState.goal },
    { label: "level", value: formState.skillLevel || "" },
    { label: "time", value: formatStudyTime(formState.studyHours) },
    { label: "deadline", value: formatTargetDate(formState.targetDate) },
    {
      label: "how you like to learn",
      value: formState.preferences.join(", "),
    },
  ];

  return (
    <main className="lumen relative isolate flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-xl py-10">
        <p className="l-readout">five answers in</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">
          Saarthi Is Building Your Path
        </h1>
        <p className="l-caption mt-3">
          your five answers become a personalized learning workflow.
        </p>

        <div className="l-well mt-8 p-5 sm:p-6">
          <dl className="grid gap-3">
            {answers.map((answer) => (
              <div
                className="grid items-baseline gap-0.5 sm:grid-cols-[9.5rem_minmax(0,1fr)]"
                key={answer.label}
              >
                <dt className="l-readout">{answer.label}</dt>
                <dd className="l-readout truncate text-ink">{answer.value}</dd>
              </div>
            ))}
          </dl>

          <div aria-live="polite" className="mt-6 border-t border-rule pt-5">
            {loadingStages.map((stage, index) => {
              const isComplete = index < activeStage;
              const isActive = index === activeStage;

              return (
                <div
                  className={cn(
                    "flex min-h-10 items-center gap-3 py-1",
                    isActive ? "text-ink" : "text-muted",
                  )}
                  key={stage}
                >
                  {isComplete ? (
                    <Check
                      className="h-4 w-4 shrink-0 text-success"
                      aria-hidden="true"
                    />
                  ) : isActive ? (
                    <LoaderCircle
                      className="h-4 w-4 shrink-0 animate-spin text-accent"
                      aria-hidden="true"
                    />
                  ) : (
                    <Circle
                      className="h-4 w-4 shrink-0 text-rule-2"
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-sm">{stage}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
