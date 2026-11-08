const questions = [
  {
    question: "What information does Saarthi.AI need?",
    answer:
      "A clear learning goal, your current skill level, available study time, and target deadline are enough to generate a complete roadmap.",
  },
  {
    question: "Does the landing page create a learning session?",
    answer:
      "No. It only introduces Saarthi.AI and takes you to Chat. A session starts only after you submit your learning request there.",
  },
  {
    question: "Can I return to my plan after refreshing?",
    answer:
      "Yes. Your current session is stored in the browser so the dashboard, learning plan, progress, and feedback views remain available.",
  },
  {
    question: "Do I need an account to start?",
    answer:
      "No. Guest learners complete the same five steps and get the same roadmap — guest plans are saved in this browser. An account keeps your learning history across devices.",
  },
];

export function FAQ() {
  return (
    <section className="scroll-mt-24 pt-[var(--section-gap)]" id="faq">
      <div className="mx-auto grid w-[min(100%-2rem,60rem)] gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div>
          <h2>Answers Before You Start</h2>
          <p className="l-caption mt-4">
            the path into your learning workflow stays simple and intentional.
          </p>
        </div>

        <div className="border-b border-rule">
          {questions.map((item) => (
            <details className="group border-t border-rule" key={item.question}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-ink [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="l-readout transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-6 text-ink-2">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
