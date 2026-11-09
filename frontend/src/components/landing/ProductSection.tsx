const captures = [
  {
    src: "/images/capture-dashboard-desktop.png",
    alt: "The dashboard: active workspace with topics completed, quiz average, mock interviews, study streak, and today's goal.",
    caption: "progress tracking",
  },
  {
    src: "/images/capture-interview-desktop.png",
    alt: "The mock interview: AI interviewer and candidate mats with a live question, recording controls, and a live transcript.",
    caption: "the mock interview",
  },
];

/**
 * The product at work: captures of the real workspace, running the sample
 * roadmap seeded for this build — the roadmap view large, progress and the
 * mock interview beside it. No mockups; the product is the picture.
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
                alt="The learning plan view: phase 01 of a roadmap with topics, estimated times, and video tutorials."
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
