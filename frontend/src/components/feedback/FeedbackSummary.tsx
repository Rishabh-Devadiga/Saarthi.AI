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
    <section className="l-card h-full p-5 sm:p-6">
      <p className="l-readout flex items-center gap-2">
        <Lightbulb className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        ai feedback
      </p>
      <h2 className="mt-2">AI Feedback</h2>
      <div className="mt-4 space-y-3">
        {summary ? (
          <p className="leading-7 text-ink-2">{summary}</p>
        ) : null}
        {motivationMessage ? (
          <div className="l-well p-3">
            <p className="font-medium leading-6 text-ink">
              {motivationMessage}
            </p>
          </div>
        ) : null}
        {confidenceLevel != null ? (
          <span className="l-tag">
            confidence: {confidenceLevel}
          </span>
        ) : null}
      </div>
    </section>
  );
}
