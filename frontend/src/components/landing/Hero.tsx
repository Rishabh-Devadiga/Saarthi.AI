import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

const PATH_QUESTIONS = ["goal", "level", "time", "deadline", "preferences"];

const ROADMAP_TERMS = [
  {
    word: "phased",
    line: "A plan broken into phases sized to the time you can give",
  },
  {
    word: "dated",
    line: "Every phase lands between today and your deadline",
  },
  {
    word: "checked",
    line: "Quizzes and reviews confirm you are moving",
  },
];

/**
 * Settled hero: the head on the left columns, the intake-to-outcome
 * artifact on the right. The five answers the wizard collects feed one
 * brass node and become the roadmap's three promises — phased, dated,
 * checked. The copy is real text (never a role="img" plate) so screen
 * readers read it; the one motion is the verb's underline draw (.l-verb).
 */
export function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto grid w-[min(100%-2rem,74rem)] items-center gap-14 pt-36 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20 lg:pt-44">
        <div>
          <p className="l-readout">an agentic learning companion</p>
          <h1 className="mt-5">
            Say the Goal, Saarthi <span className="l-verb">Plans</span> the
            Path
          </h1>
          <p className="mt-6 max-w-xl text-lg text-pretty text-ink-2">
            Five answers about you become a phased roadmap that keeps you
            moving.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link className="l-pill l-pill-primary" to="/onboarding">
              Start Your First Roadmap
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a className="l-link py-2 pr-3" href="#features">
              See It at Work
            </a>
          </div>
          <p className="l-caption mt-5">no account needed to start.</p>
        </div>

        <div className="l-well l-blueprint flex flex-col p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <p className="l-readout">five answers in</p>
            <p className="l-readout text-accent">roadmap out</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {PATH_QUESTIONS.map((question, index) => (
              <p
                className={cn(
                  "l-dnode flex min-h-11 items-baseline gap-3",
                  index === PATH_QUESTIONS.length - 1 && "sm:col-span-2",
                )}
                key={question}
              >
                <span className="l-readout shrink-0">{`0${index + 1}`}</span>
                <span>{question}</span>
              </p>
            ))}
          </div>

          <div aria-hidden="true" className="my-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-rule" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="h-px flex-1 bg-rule" />
          </div>

          <p className="l-readout">the roadmap</p>
          <dl className="mt-3">
            {ROADMAP_TERMS.map((term) => (
              <div className="border-t border-rule py-4" key={term.word}>
                <div className="grid items-baseline gap-1 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-5">
                  <dt className="l-readout text-ink">{term.word}</dt>
                  <dd className="max-w-[26rem] text-sm text-ink-2">
                    {term.line}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
