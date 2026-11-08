import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { ProgressBar } from "@/components/onboarding/ProgressBar";
import type { WizardStep } from "@/components/onboarding/types";

type OnboardingLayoutProps = {
  children: ReactNode;
  currentStep: WizardStep;
};

export function OnboardingLayout({
  children,
  currentStep,
}: OnboardingLayoutProps) {
  return (
    <div className="lumen onboarding-shell relative isolate min-h-dvh">
      <header className="border-b border-rule">
        <div className="mx-auto flex h-16 w-[min(100%-2rem,64rem)] items-center justify-between">
          <Link aria-label="Return to Saarthi.AI home" to="/">
            <img
              alt="Saarthi.AI"
              className="h-7 w-auto"
              draggable={false}
              src="/images/logo.png"
            />
          </Link>
          <Link
            aria-label="Return to Saarthi.AI home"
            className="l-navlink inline-flex items-center gap-2"
            to="/"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto flex w-[min(100%-2rem,56rem)] flex-col py-10 sm:py-14">
        <ProgressBar currentStep={currentStep} />
        <div className="l-card mt-8 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}
