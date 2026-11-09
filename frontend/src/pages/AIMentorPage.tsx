import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { MentorChat } from "@/components/mentor/MentorChat";
import { useSession } from "@/context/SessionContext";
import { sendMentorMessage } from "@/services/mentorService";
import type { MentorMessage } from "@/types/mentor";

type FailedRequest = {
  history: MentorMessage[];
  message: string;
};

export function AIMentorPage() {
  const { state } = useSession();
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [failedRequest, setFailedRequest] = useState<FailedRequest | null>(null);
  const learningGoal =
    state.intent?.learning_goal ?? state.learningPlan?.learning_goal ?? null;
  const currentTopic = useMemo(() => getCurrentTopic(state), [state]);
  const mentorMutation = useMutation({
    mutationFn: sendMentorMessage,
  });

  async function sendMessage(
    message: string,
    history: MentorMessage[] = messages,
    appendUserMessage = true
  ) {
    if (!message.trim() || mentorMutation.isPending) {
      return;
    }

    const trimmedMessage = message.trim();
    setFailedRequest(null);
    setSuggestions([]);
    if (appendUserMessage) {
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: "user", content: trimmedMessage },
      ]);
    }

    try {
      const response = await mentorMutation.mutateAsync({
        message: trimmedMessage,
        learning_goal: learningGoal,
        current_topic: currentTopic,
        conversation_history: history,
      });
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: "assistant", content: response.data.reply },
      ]);
      setSuggestions(response.data.suggested_followups);
    } catch {
      setFailedRequest({ history, message: trimmedMessage });
    }
  }

  return (
    <div className="mx-auto max-w-[960px] space-y-5">
      <header className="l-enter pt-4">
        <p className="l-readout">always on call</p>
        <h1 className="mt-2">AI Mentor</h1>
        <p className="mt-3 text-ink-2">
          Ask questions about your learning journey.
        </p>
      </header>

      <MentorChat
        isLoading={mentorMutation.isPending}
        messages={messages}
        onSend={(message) => void sendMessage(message)}
        suggestions={suggestions}
      />

      {failedRequest ? (
        <div
          className="l-card fixed bottom-5 right-5 z-[var(--z-toast)] w-[min(92vw,400px)] p-4"
          role="alert"
        >
          <div className="flex gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-error"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">
                Unable to contact AI Mentor.
              </p>
              <p className="l-caption mt-1 leading-5">
                Your conversation is still here. Retry when the service is
                available.
              </p>
              <button
                className="l-pill l-pill-ghost mt-3 h-11 px-5 text-sm"
                disabled={mentorMutation.isPending}
                onClick={() =>
                  void sendMessage(
                    failedRequest.message,
                    failedRequest.history,
                    false
                  )
                }
                type="button"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Retry
              </button>
            </div>
            <button
              aria-label="Dismiss error"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-rule text-muted"
              onClick={() => setFailedRequest(null)}
              type="button"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getCurrentTopic(
  state: ReturnType<typeof useSession>["state"]
): string | null {
  const plan = state.learningPlan;
  if (!plan) {
    return null;
  }

  const currentPhase =
    plan.phases.find(
      (phase) => phase.phase_number === state.progress?.current_phase
    ) ?? plan.phases[0];
  if (!currentPhase) {
    return null;
  }

  return (
    currentPhase.recommended_topics.find((topic) =>
      state.progress?.remaining_topics.includes(topic)
    ) ??
    currentPhase.recommended_topics[0] ??
    null
  );
}
