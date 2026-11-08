const capabilities = [
  {
    title: "AI learning planner",
    description:
      "A personalized, milestone-based roadmap built from your goal, current skill level, schedule, and target deadline.",
  },
  {
    title: "Progress tracking",
    description:
      "Completion, milestones, estimated completion date, upcoming tasks, and overall learning progress, tracked in real time.",
  },
  {
    title: "AI mentor",
    description:
      "Concept explanations, doubt solving, study guidance, and personalized support while you work.",
  },
  {
    title: "Quizzes and knowledge checks",
    description:
      "AI-generated quizzes that assess your understanding and identify concepts that need revision.",
  },
  {
    title: "Mock interviews",
    description:
      "Practice interviews with voice interaction, instant evaluation, and detailed performance feedback.",
  },
  {
    title: "Feedback and nudges",
    description:
      "Personalized feedback, actionable recommendations, and intelligent nudges that keep the next step visible.",
  },
  {
    title: "YouTube learning resources",
    description:
      "Curated resources for every topic, with estimated learning time based on real video durations.",
  },
  {
    title: "Google Calendar integration",
    description:
      "Sync the roadmap to your calendar so study sessions are scheduled and visible.",
  },
];

/**
 * Capabilities as hairline rows, not cards: title on the left column,
 * the work on the right, one idea a row. All eight capabilities the page
 * had, kept in the product's own nouns.
 */
export function FeatureGrid() {
  return (
    <section className="scroll-mt-24 pt-[var(--section-gap)]" id="features">
      <div className="mx-auto w-[min(100%-2rem,74rem)]">
        <div className="max-w-2xl">
          <h2>everything saarthi carries</h2>
          <p className="mt-4 text-lg text-ink-2">
            planning, progress, coaching, and accountability, connected into
            one clear learning experience.
          </p>
        </div>

        <div className="mt-12">
          {capabilities.map((capability) => (
            <article className="l-row" key={capability.title}>
              <h3>{capability.title}</h3>
              <p className="max-w-xl text-ink-2">{capability.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
