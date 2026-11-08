import { ArrowLeft, ArrowRight } from "lucide-react";

import type { WizardStep } from "@/components/onboarding/types";
import { cn } from "@/utils/cn";

type WizardNavigationProps = {
  canContinue: boolean;
  currentStep: WizardStep;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

export function WizardNavigation({
  canContinue,
  currentStep,
  onBack,
  onNext,
  onSubmit,
}: WizardNavigationProps) {
  const isFinalStep = currentStep === 5;
  const label = isFinalStep ? "Build My Learning Plan" : "Continue";

  return (
    <footer className="flex flex-col-reverse gap-3 border-t border-rule px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <button
        className={cn("l-pill l-pill-ghost", currentStep === 1 ? "invisible" : "")}
        disabled={currentStep === 1}
        onClick={onBack}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </button>

      <button
        className="l-pill l-pill-primary w-full sm:w-auto"
        disabled={!canContinue}
        onClick={isFinalStep ? onSubmit : onNext}
        type="button"
      >
        {label}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </footer>
  );
}
