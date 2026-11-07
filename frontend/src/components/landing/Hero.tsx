import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PATH_QUESTIONS = ["goal", "level", "time", "deadline", "preferences"];

/**
 * Settled hero: the head on the left columns, the five-answer diagram on
 * the right. The diagram is the signature — the five answers the wizard
 * collects, ruled into the roadmap that comes out. No parallax machinery;
 * the one motion is the verb's underline draw (.l-verb).
 */
export function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto grid w-[min(100%-2rem,74rem)] items-center gap-14 pb-[var(--section-gap)] pt-36 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20 lg:pt-44">
        <div>
          <p className="l-readout">an agentic learning companion</p>
          <h1 className="mt-5">
            say the goal, saarthi <span className="l-verb">plans</span> the
            path
          </h1>
          <p className="mt-6 max-w-xl text-lg text-pretty text-ink-2">
            five answers about you become a phased roadmap that keeps you
            moving.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link className="l-pill l-pill-primary" to="/onboarding">
              start your first roadmap
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a className="l-link py-2 pr-3" href="#features">
              see it at work
            </a>
          </div>
          <p className="l-caption mt-5">no account needed to start.</p>
        </div>

        <div
          aria-label="how the five answers become a roadmap"
          className="l-well l-blueprint scroll-mt-28 p-6 sm:p-9"
          id="how-it-works"
          role="img"
        >
          <p className="l-readout">five answers in</p>
          <div className="mt-5 grid justify-items-center">
            {PATH_QUESTIONS.map((question, index) => (
              <div className="grid justify-items-center" key={question}>
                <span className="l-dnode grid w-44 grid-cols-[1.5rem_minmax(0,1fr)] items-baseline gap-2 sm:w-48">
                  <span className="l-readout">{`0${index + 1}`}</span>
                  <span>{question}</span>
                </span>
                {index < PATH_QUESTIONS.length - 1 ? (
                  <span aria-hidden="true" className="h-4 w-px bg-rule sm:h-5" />
                ) : null}
              </div>
            ))}
          </div>
          <div className="l-dnode is-live mt-5 flex flex-col items-center gap-1 px-5 py-3 text-center">
            <span>the roadmap</span>
            <span className="l-readout flex items-center gap-2">
              <span>phased</span>
              <span aria-hidden="true" className="h-3 w-px bg-rule-2" />
              <span>dated</span>
              <span aria-hidden="true" className="h-3 w-px bg-rule-2" />
              <span>checked</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
