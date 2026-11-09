import {
  LogOut,
  Mic,
  Send,
  Square,
  Volume2,
  VolumeOff,
} from "lucide-react";

type InterviewControlBarProps = {
  canSubmit: boolean;
  isLoading: boolean;
  isMuted: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  onEnd: () => void;
  onReplay: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSubmit: () => void;
  onToggleMute: () => void;
  recognitionSupported: boolean;
  speechSupported: boolean;
};

export function InterviewControlBar({
  canSubmit,
  isLoading,
  isMuted,
  isRecording,
  isSpeaking,
  onEnd,
  onReplay,
  onStartRecording,
  onStopRecording,
  onSubmit,
  onToggleMute,
  recognitionSupported,
  speechSupported,
}: InterviewControlBarProps) {
  return (
    <section className="l-stage p-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          className="l-pill l-pill-ghost h-11 px-5 text-sm"
          disabled={!speechSupported || isMuted || isSpeaking || isLoading}
          onClick={onReplay}
          type="button"
        >
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          Replay
        </button>
        <button
          className="l-pill l-pill-ghost h-11 px-5 text-sm"
          disabled={!speechSupported || isLoading}
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

        {isRecording ? (
          <button
            className="l-pill l-pill-ghost h-11 px-5 text-sm"
            disabled={isLoading}
            onClick={onStopRecording}
            type="button"
          >
            <Square className="h-4 w-4 fill-current" aria-hidden="true" />
            Stop
          </button>
        ) : (
          <button
            className="l-pill l-pill-primary h-11 px-5 text-sm"
            disabled={!recognitionSupported || isLoading || isSpeaking}
            onClick={onStartRecording}
            type="button"
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
            Start Recording
          </button>
        )}

        <button
          className="l-pill l-pill-primary h-11 px-5 text-sm"
          disabled={!canSubmit || isLoading || isRecording}
          onClick={onSubmit}
          type="button"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {isLoading ? "Submitting…" : "Submit Answer"}
        </button>
        <button
          className="l-pill l-pill-ghost h-11 px-5 text-sm text-error"
          disabled={isLoading || isRecording}
          onClick={onEnd}
          type="button"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          End Interview
        </button>
      </div>
    </section>
  );
}
