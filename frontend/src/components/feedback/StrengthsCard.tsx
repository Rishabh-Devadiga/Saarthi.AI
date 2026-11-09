import { CheckCircle2 } from "lucide-react";

type StrengthsCardProps = {
  strengths: string[];
};

export function StrengthsCard({ strengths }: StrengthsCardProps) {
  if (strengths.length === 0) {
    return null;
  }

  return (
    <section className="l-card h-full p-5 sm:p-6">
      <p className="l-readout">what is working</p>
      <h2 className="mt-2">Strengths</h2>
      <ul className="mt-4 space-y-3">
        {strengths.map((strength) => (
          <li
            className="flex gap-3 text-sm leading-6 text-ink-2"
            key={strength}
          >
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-success"
              aria-hidden="true"
            />
            <span>{strength}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
