const captures = [
  {
    src: "/images/capture-dashboard-desktop.png",
    alt: "The dashboard: progress at 36 percent, four of nine topics completed, and today's recommended next step.",
    caption: "progress tracking",
  },
  {
    src: "/images/capture-mentor-desktop.png",
    alt: "The AI mentor's chat, with prompt suggestions to explain concepts or test understanding.",
    caption: "the ai mentor",
  },
];

/**
 * The product at work: captures of the real workspace, running the sample
 * roadmap seeded for this build — the roadmap view large, progress and the
 * mentor beside it. No mockups; the product is the picture.
 */
export function ProductSection() {
  return (
    <section className="scroll-mt-24 pt-[var(--section-gap)]" id="how-it-works">
      <div className="mx-auto w-[min(100%-2rem,74rem)]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <h2>The Product at Work</h2>
          <p className="max-w-md text-lg text-ink-2 lg:justify-self-end lg:text-right">
            Captures of the real workspace, running a sample roadmap from the
            five answers.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <figure className="m-0 grid gap-3">
            <div className="l-capture aspect-[16/10]">
              <img
                alt="The learning plan view: a three-phase roadmap for learning Python, with subject, skill level, target completion, and daily study time."
                src="/images/capture-plan-desktop.png"
              />
            </div>
            <figcaption className="l-readout">the roadmap view</figcaption>
          </figure>

          <div className="grid content-start gap-6">
            {captures.map((capture) => (
              <figure className="m-0 grid gap-3" key={capture.src}>
                <div className="l-capture aspect-[16/10] overflow-hidden">
                  <img
                    alt={capture.alt}
                    loading="lazy"
                    src={capture.src}
                  />
                </div>
                <figcaption className="l-readout">{capture.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
