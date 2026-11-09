type ImprovementsCardProps = {
  improvements: string[];
};

export function ImprovementsCard({ improvements }: ImprovementsCardProps) {
  if (improvements.length === 0) {
    return null;
  }

  return (
    <section className="l-card h-full p-5 sm:p-6">
      <p className="l-readout">where to aim next</p>
      <h2 className="mt-2">Areas for Improvement</h2>
      <ul className="mt-4 space-y-3">
        {improvements.map((improvement) => (
          <li
            className="flex gap-3 text-sm leading-6 text-ink-2"
            key={improvement}
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-2" />
            <span>{improvement}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
