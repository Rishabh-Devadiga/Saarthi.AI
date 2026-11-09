import { MessageCircle } from "lucide-react";

import type { NudgeReport } from "@/types/learning";

type NudgeCardProps = {
  nudge: NudgeReport | null;
};

export function NudgeCard({ nudge }: NudgeCardProps) {
  return (
    <section className="l-card h-full p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-rule bg-paper">
          <MessageCircle
            className="h-4.5 w-4.5 text-accent-2"
            aria-hidden="true"
          />
        </span>
        <div>
          <p className="l-readout">momentum nudges</p>
          <h2 className="mt-1">Latest Nudge</h2>
        </div>
      </div>
      {nudge ? (
        <div className="mt-4 space-y-3">
          <p className="leading-6 text-ink-2">{nudge.personalized_message}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="l-well p-3">
              <p className="l-readout">urgency</p>
              <p className="mt-1 font-medium text-ink">{nudge.urgency}</p>
            </div>
            <div className="l-well p-3">
              <p className="l-readout">recommended action</p>
              <p className="mt-1 font-medium leading-6 text-ink">
                {nudge.recommended_action}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="l-caption mt-4">No nudge available yet.</p>
      )}
    </section>
  );
}
