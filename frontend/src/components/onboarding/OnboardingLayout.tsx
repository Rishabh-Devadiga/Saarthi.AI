import { ArrowLeft, Sparkles } from "lucide-react";
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
    <div className="onboarding-shell relative isolate min-h-screen overflow-hidden bg-[#0e0718] text-white">
      {/* Same space artwork as the landing page, fixed behind the flow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/space-hero.png)" }}
      />
      {/* Focus scrim: same purple, kept calm and readable for the form */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[#0e0718]/78"
      />

      <header className="relative border-b border-white/10 bg-[#0e0718]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-18 w-[min(100%-2rem,1120px)] items-center justify-between">
          <Link
            aria-label="Return to Saarthi.AI home"
            className="inline-flex items-center gap-2.5 font-semibold"
            to="/"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-400 text-[#06281f] shadow-[0_8px_24px_rgba(45,212,191,0.35)]">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg">Saarthi.AI</span>
          </Link>
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            to="/"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto flex w-[min(100%-2rem,920px)] flex-col py-8 sm:py-12">
        <ProgressBar currentStep={currentStep} />
        <div className="mt-7 overflow-hidden rounded-lg border border-white/12 bg-[#150b28]/88 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {children}
        </div>
      </main>
    </div>
  );
}
