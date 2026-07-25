import { MessageCircle } from "lucide-react";

import type { NudgeReport } from "@/types/learning";

type NudgeCardProps = {
  nudge: NudgeReport | null;
};

export function NudgeCard({ nudge }: NudgeCardProps) {
  return (
    <section className="h-full rounded-md border border-white/[0.08] bg-[#1A2235] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-white/[0.14]">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-base font-semibold text-slate-950">Latest Nudge</h2>
      </div>
      {nudge ? (
        <div className="space-y-3">
          <p className="text-sm leading-6 text-slate-700">
            {nudge.personalized_message}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Urgency
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {nudge.urgency}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Action
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">
                {nudge.recommended_action}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-600">No nudge available yet.</p>
      )}
    </section>
  );
}
