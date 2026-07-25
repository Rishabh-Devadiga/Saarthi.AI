import {
  AlertTriangle,
  Mic,
  Send,
  Square,
  Volume2,
  VolumeOff,
} from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/components/common/Button";
import { InterviewProgress } from "@/components/interview/InterviewProgress";
import { InterviewQuestionCard } from "@/components/interview/InterviewQuestionCard";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import type { InterviewQuestion } from "@/types/interview";

type InterviewSessionProps = {
  feedback: string | null;
  isLoading: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  onSubmit: (answer: string) => void;
  onReplayQuestion: () => void;
  onToggleMute: () => void;
  question: InterviewQuestion;
  speechError: string | null;
  speechSupported: boolean;
};

export function InterviewSession({
  feedback,
  isLoading,
  isMuted,
  isSpeaking,
  onReplayQuestion,
  onSubmit,
  onToggleMute,
  question,
  speechError,
  speechSupported,
}: InterviewSessionProps) {
  const {
    error,
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    transcript,
  } = useSpeechRecognition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTranscript = transcript.trim();
    if (!trimmedTranscript || isLoading || isRecording) {
      return;
    }
    onSubmit(trimmedTranscript);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <InterviewProgress
          current={question.question_number}
          total={question.total_questions}
        />
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
          <Button
            disabled={!speechSupported}
            onClick={onToggleMute}
            size="default"
            variant="outline"
          >
            {isMuted ? (
              <VolumeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            )}
            {isMuted ? "Unmute" : "Mute"}
          </Button>
          <Button
            disabled={!speechSupported || isMuted || isSpeaking}
            onClick={onReplayQuestion}
            size="default"
            variant="outline"
          >
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            Replay Question
          </Button>
          {isSpeaking ? (
            <span
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
              role="status"
            >
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Speaking...
            </span>
          ) : null}
        </div>
      </section>

      {feedback ? (
        <p
          className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
          role="status"
        >
          Answer recorded.
        </p>
      ) : null}

      <InterviewQuestionCard question={question} />

      {!speechSupported ? (
        <VoiceError message="Voice playback is not supported in this browser. The interview will continue without spoken questions." />
      ) : null}

      {speechError ? <VoiceError message={speechError} /> : null}

      <form
        className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Your Spoken Answer
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Record your answer, review the read-only transcript, then submit.
            </p>
          </div>

          {isRecording ? (
            <Button
              disabled={isLoading}
              onClick={stopRecording}
              variant="outline"
            >
              <Square className="h-4 w-4 fill-current" aria-hidden="true" />
              Stop Recording
            </Button>
          ) : (
            <Button
              disabled={!isSupported || isLoading || isSpeaking}
              onClick={startRecording}
              variant="outline"
            >
              <Mic className="h-4 w-4" aria-hidden="true" />
              {transcript ? "Record Again" : "Start Recording"}
            </Button>
          )}
        </div>

        {isRecording ? (
          <div
            className="mt-5 flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
            role="status"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Listening...
          </div>
        ) : null}

        {!isSupported ? (
          <VoiceError message="Speech recognition is not supported in this browser. Use a current version of Chrome or Edge." />
        ) : null}

        {error ? <VoiceError message={error} /> : null}

        <div
          aria-label="Speech transcript"
          aria-live="polite"
          aria-readonly="true"
          className="mt-5 min-h-44 w-full whitespace-pre-wrap rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
          role="textbox"
        >
          {transcript || (
            <span className="text-slate-500">
              Your live transcript will appear here while you speak.
            </span>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            disabled={!transcript.trim() || isLoading || isRecording}
            type="submit"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {isLoading ? "Submitting..." : "Submit Answer"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function VoiceError({ message }: { message: string }) {
  return (
    <div
      className="mt-4 flex gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      role="alert"
    >
      <AlertTriangle
        className="mt-0.5 h-4 w-4 shrink-0"
        aria-hidden="true"
      />
      <span>{message}</span>
    </div>
  );
}
