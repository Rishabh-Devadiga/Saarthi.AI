import { AlertTriangle, UserRound } from "lucide-react";

import { VoiceWaveform } from "@/components/interview/VoiceWaveform";

type CandidateCardProps = {
  error: string | null;
  isRecording: boolean;
  isSupported: boolean;
  transcript: string;
};

export function CandidateCard({
  error,
  isRecording,
  isSupported,
  transcript,
}: CandidateCardProps) {
  return (
    <article className="l-stage flex min-h-52 flex-col p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-rule-2 bg-paper">
            <UserRound
              className="h-6 w-6 text-accent-2"
              aria-hidden="true"
            />
          </span>
          <div>
            <p className="font-medium text-ink">Candidate</p>
            <p className="l-caption mt-0.5">Your live response</p>
          </div>
        </div>
        <span className="l-readout inline-flex h-max items-center gap-2 rounded-[var(--radius-card)] border border-rule-2 bg-paper px-3 py-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              isRecording ? "bg-error" : "bg-success"
            }`}
          />
          {isRecording ? "Listening…" : transcript ? "Ready" : "Waiting…"}
        </span>
      </div>

      {isRecording ? (
        <div className="mt-2 flex justify-center">
          <VoiceWaveform active variant="candidate" />
        </div>
      ) : null}

      <div
        aria-label="Speech transcript"
        aria-live="polite"
        aria-readonly="true"
        className="mt-4 min-h-24 flex-1 overflow-y-auto border border-rule-2 bg-paper px-4 py-3 text-sm leading-6 text-ink-2 rounded-[var(--radius-card)]"
        role="textbox"
      >
        {transcript || (
          <span className="text-muted">
            Your live transcript will appear here while you speak.
          </span>
        )}
      </div>

      {!isSupported || error ? (
        <div
          className="mt-3 flex gap-2 text-xs leading-5 text-muted"
          role="alert"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-error"
            aria-hidden="true"
          />
          <span>
            {error ?? "Speech recognition is not supported in this browser."}
          </span>
        </div>
      ) : null}
    </article>
  );
}
