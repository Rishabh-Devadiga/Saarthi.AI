import type { WizardStep } from "@/components/onboarding/types";
import { cn } from "@/utils/cn";

const stepLabels = ["goal", "level", "study time", "deadline", "preferences"];

/**
 * The path: five nodes on a hairline, the current node brass — the same
 * five-answer signature the landing hero draws. Labels read in mono,
 * lowercase; the readout line announces position.
 */
export function ProgressBar({ currentStep }: { currentStep: WizardStep }) {
  return (
    <nav aria-label={`Step ${currentStep} of 5`} className="w-full">
      <div className="flex items-baseline justify-between gap-4">
        <p className="l-caption">build your learning profile</p>
        <p className="l-readout">{`step ${currentStep} of 5`}</p>
      </div>

      <ol className="mt-6 flex items-start justify-between">
        {stepLabels.map((label, index) => {
          const number = index + 1;
          const isDone = number < currentStep;
          const isCurrent = number === currentStep;
          const isLast = index === stepLabels.length - 1;
          const isSeen = isDone || isCurrent;

          return (
            <li
              aria-current={isCurrent ? "step" : undefined}
              className="flex items-start"
              key={label}
            >
              <div className="flex flex-col items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    "l-path-node",
                    isCurrent && "is-active",
                    isDone && "is-done",
                  )}
                />
                <span
                  className={cn(
                    "hidden sm:block",
                    isSeen ? "l-readout text-ink" : "l-readout",
                  )}
                >
                  {label}
                </span>
              </div>
              {isLast ? null : (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-[4px] h-px w-8 sm:w-14",
                    isDone ? "bg-rule-2" : "bg-rule",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
