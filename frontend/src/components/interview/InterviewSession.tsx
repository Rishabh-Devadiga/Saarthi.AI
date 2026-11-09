import { AlertTriangle } from "lucide-react";
import { useState } from "react";

import {
  AIInterviewerCard,
  type InterviewerStatus,
} from "@/components/interview/AIInterviewerCard";
import { CandidateCard } from "@/components/interview/CandidateCard";
import { EndInterviewDialog } from "@/components/interview/EndInterviewDialog";
import { InterviewControlBar } from "@/components/interview/InterviewControlBar";
import { InterviewProgress } from "@/components/interview/InterviewProgress";
import { InterviewQuestionCard } from "@/components/interview/InterviewQuestionCard";
import { InterviewTimer } from "@/components/interview/InterviewTimer";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import type { InterviewQuestion } from "@/types/interview";

type InterviewSessionProps = {
  feedback: string | null;
  isLoading: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  onEnd: () => void;
  onReplayQuestion: () => void;
  onSubmit: (answer: string) => void;
  onToggleMute: () => void;
  question: InterviewQuestion;
  speechError: string | null;
  speechSupported: boolean;
  startedAt: number;
};

export function InterviewSession({
  feedback,
  isLoading,
  isMuted,
  isSpeaking,
  onEnd,
  onReplayQuestion,
  onSubmit,
  onToggleMute,
  question,
  speechError,
  speechSupported,
  startedAt,
}: InterviewSessionProps) {
  const {
    error,
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    transcript,
  } = useSpeechRecognition();
  const [showEndDialog, setShowEndDialog] = useState(false);

  function handleSubmit() {
    const trimmedTranscript = transcript.trim();
    if (!trimmedTranscript || isLoading || isRecording) {
      return;
    }
    onSubmit(trimmedTranscript);
  }

  function handleConfirmEnd() {
    setShowEndDialog(false);
    onEnd();
  }

  const interviewerStatus: InterviewerStatus = isSpeaking
    ? "Speaking…"
    : isLoading
      ? "Thinking…"
      : isRecording
        ? "Listening…"
        : "Waiting…";

  return (
    <div className="space-y-4">
      <section className="l-stage p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <InterviewProgress
              current={question.question_number}
              total={question.total_questions}
            />
          </div>
          <InterviewTimer startedAt={startedAt} />
        </div>
      </section>

      {feedback ? (
        <p
          className="border border-[color-mix(in_oklab,var(--color-live)_35%,transparent)] bg-[color-mix(in_oklab,var(--color-live)_12%,transparent)] px-4 py-3 text-sm rounded-[var(--radius-card)] text-ink"
          role="status"
        >
          Answer recorded. The interviewer is preparing the next question.
        </p>
      ) : null}

      <InterviewQuestionCard question={question} />

      <div className="grid gap-4 md:grid-cols-2">
        <AIInterviewerCard status={interviewerStatus} />
        <CandidateCard
          error={error}
          isRecording={isRecording}
          isSupported={isSupported}
          transcript={transcript}
        />
      </div>

      {!speechSupported || speechError ? (
        <VoiceError
          message={
            speechError ??
            "Voice playback is unavailable. The interview will continue normally."
          }
        />
      ) : null}

      <InterviewControlBar
        canSubmit={Boolean(transcript.trim())}
        isLoading={isLoading}
        isMuted={isMuted}
        isRecording={isRecording}
        isSpeaking={isSpeaking}
        onEnd={() => setShowEndDialog(true)}
        onReplay={onReplayQuestion}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onSubmit={handleSubmit}
        onToggleMute={onToggleMute}
        recognitionSupported={isSupported}
        speechSupported={speechSupported}
      />

      <EndInterviewDialog
        isEnding={isLoading}
        onCancel={() => setShowEndDialog(false)}
        onConfirm={handleConfirmEnd}
        open={showEndDialog}
      />
    </div>
  );
}

function VoiceError({ message }: { message: string }) {
  return (
    <div
      className="l-alert flex gap-3 px-4 py-3 text-sm rounded-[var(--radius-card)]"
      role="alert"
    >
      <AlertTriangle
        className="mt-0.5 h-4 w-4 shrink-0 text-error"
        aria-hidden="true"
      />
      <span className="text-ink-2">{message}</span>
    </div>
  );
}
