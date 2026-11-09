import { Lightbulb } from "lucide-react";

import type { FeedbackReport } from "@/types/learning";

type FeedbackCardProps = {
  feedback: FeedbackReport | null;
};

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <section className="l-card h-full p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-rule bg-paper">
          <Lightbulb className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
        </span>
        <div>
          <p className="l-readout">ai feedback</p>
          <h2 className="mt-1">Latest Feedback</h2>
        </div>
      </div>
      {feedback ? (
        <div className="mt-4 space-y-3">
          <p className="leading-6 text-ink-2">
            {feedback.overall_performance_assessment}
          </p>
          <div className="l-well p-3">
            <p className="leading-6 text-ink">{feedback.motivation_message}</p>
          </div>
        </div>
      ) : (
        <p className="l-caption mt-4">No feedback available yet.</p>
      )}
    </section>
  );
}
