import type { WizardStep } from "@/components/onboarding/types";
import { cn } from "@/utils/cn";

const stepLabels = ["goal", "level", "study time", "deadline", "preferences"];

/**
 * The path: five nodes on a hairline, the current node brass — the same
 * five-answer signature the landing hero draws. Every cell is one equal
 * `flex-1` share (`justify-between` gone), so the hairline between two
 * nodes always runs centre to centre, at any width and any label length.
 */
export function ProgressBar({ currentStep }: { currentStep: WizardStep }) {
  return (
    <nav aria-label={`Step ${currentStep} of 5`} className="w-full">
      <div className="flex items-baseline justify-between gap-4">
        <p className="l-caption">build your learning profile</p>
        <p className="l-readout">{`step ${currentStep} of 5`}</p>
      </div>

      <ol className="mt-6 flex w-full items-start">
        {stepLabels.map((label, index) => {
          const number = index + 1;
          const isDone = number < currentStep;
          const isCurrent = number === currentStep;
          const isLast = number === stepLabels.length;
          const isSeen = isDone || isCurrent;

          return (
            <li
              aria-current={isCurrent ? "step" : undefined}
              className="relative flex flex-1 flex-col items-center"
              key={label}
            >
              {isLast ? null : (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-[calc(50%+5px)] right-[calc(-50%+5px)] top-[4.5px] h-px",
                    isDone ? "bg-rule-2" : "bg-rule",
                  )}
                />
              )}
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
                  "mt-2 hidden sm:block",
                  isSeen ? "l-readout text-ink" : "l-readout",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
