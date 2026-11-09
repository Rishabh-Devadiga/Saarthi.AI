import { Bot } from "lucide-react";

import { VoiceWaveform } from "@/components/interview/VoiceWaveform";

export type InterviewerStatus =
  | "Speaking…"
  | "Thinking…"
  | "Listening…"
  | "Waiting…";

type AIInterviewerCardProps = {
  status: InterviewerStatus;
};

export function AIInterviewerCard({ status }: AIInterviewerCardProps) {
  const isSpeaking = status === "Speaking…";

  return (
    <article className="l-stage flex min-h-52 flex-col justify-between p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-rule-2 bg-paper">
            <Bot className="h-6 w-6 text-accent" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium text-ink">AI Interviewer</p>
            <p className="l-caption mt-0.5">Saarthi interview coach</p>
          </div>
        </div>
        <span className="l-readout inline-flex h-max items-center gap-2 rounded-[var(--radius-card)] border border-rule-2 bg-paper px-3 py-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              isSpeaking ? "bg-accent" : "bg-muted"
            }`}
          />
          {status}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-4">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-rule-2 bg-paper">
          {isSpeaking ? (
            <span className="absolute inset-0 animate-ping rounded-full border border-accent/40" />
          ) : null}
          <Bot
            className="relative h-9 w-9 text-accent"
            aria-hidden="true"
          />
        </div>
        <VoiceWaveform active={isSpeaking} variant="ai" />
      </div>
    </article>
  );
}
