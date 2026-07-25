import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

type NextActionCardProps = {
  nextAction: string | null;
};

export function NextActionCard({ nextAction }: NextActionCardProps) {
  if (!nextAction) {
    return null;
  }

  return (
    <section className="rounded-md border border-white/[0.08] bg-[#1A2235] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-white/[0.14] sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-blue-500 text-white">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-base font-semibold text-slate-950">
          Next Recommended Action
        </h2>
      </div>
      <p className="text-sm leading-6 text-slate-700">{nextAction}</p>
      <Link
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        to="/learning-plan"
      >
        Review Roadmap
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
