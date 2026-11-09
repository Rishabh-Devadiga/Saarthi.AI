import {
  ArrowLeft,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeOff,
  Wrench,
} from "lucide-react";

import type { InterviewSummary } from "@/types/interview";
import { formatElapsedTime } from "@/utils/interview";

type InterviewResultsProps = {
  elapsedSeconds: number;
  isMuted: boolean;
  isSpeaking: boolean;
  onDashboard: () => void;
  onRetry: () => void;
  onToggleMute: () => void;
  speechSupported: boolean;
  summary: InterviewSummary;
};

export function InterviewResults({
  elapsedSeconds,
  isMuted,
  isSpeaking,
  onDashboard,
  onRetry,
  onToggleMute,
  speechSupported,
  summary,
}: InterviewResultsProps) {
  const scores = [
    {
      label: "Technical Score",
      value: summary.technical_score,
      icon: Wrench,
    },
    {
      label: "Communication Score",
      value: summary.communication_score,
      icon: MessageSquareText,
    },
    {
      label: "Confidence Score",
      value: summary.confidence_score,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="l-enter pt-4">
        <p className="l-readout flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          interview complete
        </p>
        <h1 className="mt-2">Your Interview Results</h1>
        <p className="l-readout mt-3">
          {summary.questions_answered} questions answered in{" "}
          {formatElapsedTime(elapsedSeconds)}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            className="l-pill l-pill-ghost"
            disabled={!speechSupported}
            onClick={onToggleMute}
            type="button"
          >
            {isMuted ? (
              <VolumeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            )}
            {isMuted ? "Unmute" : "Mute"}
          </button>
          {isSpeaking ? (
            <span className="l-readout inline-flex items-center gap-2" role="status">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Speaking…
            </span>
          ) : null}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {scores.map(({ icon: Icon, label, value }) => (
          <article
            className="l-card p-5"
            key={label}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-rule bg-paper">
                <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
              </span>
              <span className="font-outlier text-3xl text-ink">{value}</span>
            </div>
            <p className="mt-4 text-sm text-ink-2">{label}</p>
          </article>
        ))}
      </div>

      <section className="l-card p-5 sm:p-7">
        <h2>Overall Feedback</h2>
        <p className="mt-3 leading-7 text-ink-2">
          {summary.overall_feedback}
        </p>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          className="l-pill l-pill-ghost"
          onClick={onDashboard}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Return to Dashboard
        </button>
        <button
          className="l-pill l-pill-primary"
          onClick={onRetry}
          type="button"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry Interview
        </button>
      </div>
    </div>
  );
}
