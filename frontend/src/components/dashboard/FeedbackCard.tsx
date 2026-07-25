import { Lightbulb } from "lucide-react";

import type { FeedbackReport } from "@/types/learning";

type FeedbackCardProps = {
  feedback: FeedbackReport | null;
};

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <section className="h-full rounded-md border border-white/[0.08] bg-[#1A2235] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-white/[0.14]">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-blue-500 text-white">
          <Lightbulb className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-base font-semibold text-slate-950">
          Latest Feedback
        </h2>
      </div>
      {feedback ? (
        <div className="space-y-3">
          <p className="text-sm leading-6 text-slate-700">
            {feedback.overall_performance_assessment}
          </p>
          <p className="rounded-md bg-slate-50 p-3 text-sm font-medium leading-6 text-slate-800">
            {feedback.motivation_message}
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-600">No feedback available yet.</p>
      )}
    </section>
  );
}
