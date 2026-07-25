import { CheckCircle2 } from "lucide-react";

type StrengthsCardProps = {
  strengths: string[];
};

export function StrengthsCard({ strengths }: StrengthsCardProps) {
  if (strengths.length === 0) {
    return null;
  }

  return (
    <section className="h-full rounded-md border border-white/[0.08] bg-[#1A2235] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-white/[0.14] sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-base font-semibold text-slate-950">Strengths</h2>
      </div>
      <ul className="space-y-3">
        {strengths.map((strength) => (
          <li className="flex gap-3 text-sm leading-6 text-slate-700" key={strength}>
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <span>{strength}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
