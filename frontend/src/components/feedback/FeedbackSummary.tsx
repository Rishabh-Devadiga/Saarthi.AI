import { Lightbulb } from "lucide-react";

type FeedbackSummaryProps = {
  confidenceLevel?: string | number | null;
  motivationMessage: string | null;
  summary: string | null;
};

export function FeedbackSummary({
  confidenceLevel,
  motivationMessage,
  summary,
}: FeedbackSummaryProps) {
  if (!summary && !motivationMessage && confidenceLevel == null) {
    return null;
  }

  return (
    <section className="h-full rounded-md border border-white/[0.08] bg-[#1A2235] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-white/[0.14] sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-violet-500 text-white">
          <Lightbulb className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-base font-semibold text-slate-950">AI Feedback</h2>
      </div>
      <div className="space-y-3">
        {summary ? (
          <p className="text-sm leading-6 text-slate-700">{summary}</p>
        ) : null}
        {motivationMessage ? (
          <p className="rounded-md bg-slate-50 p-3 text-sm font-medium leading-6 text-slate-800">
            {motivationMessage}
          </p>
        ) : null}
        {confidenceLevel != null ? (
          <div className="inline-flex items-center rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Confidence: {confidenceLevel}
          </div>
        ) : null}
      </div>
    </section>
  );
}
