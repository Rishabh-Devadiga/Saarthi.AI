import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * The close band: one change of paper, edge to edge. The statement is the
 * page's last big voice; beneath its hairline, the three ways in stand
 * across the band: the owner's start, the returning learner's sign in,
 * and the honest guest note.
 */
export function CTASection() {
  return (
    <section className="l-band">
      <div className="mx-auto w-[min(100%-2rem,74rem)] py-[var(--section-gap)]">
        <h2>Start with the Answers You Have</h2>
        <p className="mt-5 max-w-xl text-lg text-ink-2">
          Turn your goal into a practical roadmap, then keep moving with
          clear progress, adaptive feedback, and accountable next steps.
        </p>

        <div className="mt-12 grid gap-6 border-t border-rule pt-10 sm:grid-cols-3 sm:items-start sm:gap-8">
          <div>
            <Link className="l-pill l-pill-primary" to="/onboarding">
              Generate My Learning Plan
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="sm:justify-self-center">
            <Link className="l-pill l-pill-ghost" to="/signin">
              Sign In
            </Link>
          </div>
          <p className="l-caption max-w-xs sm:justify-self-end sm:text-right">
            no account needed: guest plans are saved in this browser.
          </p>
        </div>
      </div>
    </section>
  );
}
