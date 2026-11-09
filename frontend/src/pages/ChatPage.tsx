import { useState } from "react";

import { ChatInput } from "@/components/chat/ChatInput";
import { ChatResponse } from "@/components/chat/ChatResponse";
import { ErrorState } from "@/components/chat/ErrorState";
import { LoadingState } from "@/components/chat/LoadingState";
import { ApiRequestError } from "@/api/apiClient";
import { useSession } from "@/context/SessionContext";
import type { SessionState } from "@/context/sessionTypes";
import { useStartLearningSession } from "@/hooks/useLearningApi";
import type { LearningSessionResponse } from "@/types/learning";

const MIN_PROMPT_LENGTH = 10;

export function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [lastSubmittedPrompt, setLastSubmittedPrompt] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { saveWorkflow, setError, setLoading, state: sessionState } =
    useSession();
  const startLearningSession = useStartLearningSession();

  const response =
    startLearningSession.data?.data ?? sessionStateToWorkflow(sessionState);
  const apiError = startLearningSession.error?.message ?? null;
  const isLlmUnavailable =
    startLearningSession.error instanceof ApiRequestError &&
    startLearningSession.error.errorCode === "LLM_UNAVAILABLE";

  function handlePromptChange(value: string) {
    setPrompt(value);
    if (validationError) {
      setValidationError(null);
    }
  }

  function handleSubmit() {
    const trimmedPrompt = prompt.trim();
    submitPrompt(trimmedPrompt);
  }

  function submitPrompt(trimmedPrompt: string) {
    if (startLearningSession.isPending) {
      return;
    }

    if (!trimmedPrompt) {
      setValidationError("Enter a learning goal before generating a plan.");
      return;
    }

    if (trimmedPrompt.length < MIN_PROMPT_LENGTH) {
      setValidationError(
        `Your learning goal must be at least ${MIN_PROMPT_LENGTH} characters.`
      );
      return;
    }

    setValidationError(null);
    setLastSubmittedPrompt(trimmedPrompt);
    setLoading();
    startLearningSession.mutate(
      {
        user_name: "Frontend Learner",
        email: null,
        prompt: trimmedPrompt,
      },
      {
        onSuccess: (data) => {
          saveWorkflow(data.data);
        },
        onError: (error) => {
          setError(error.message);
        },
      }
    );
  }

  function handleRetry() {
    if (lastSubmittedPrompt) {
      setPrompt(lastSubmittedPrompt);
      submitPrompt(lastSubmittedPrompt);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="l-enter pt-4">
        <p className="l-readout">plan intake</p>
        <h1 className="mt-2">Build your personalized learning plan</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-2">
          Tell the AI Learning Agent what you want to learn, your timeline, and
          your current level. It will generate a structured roadmap with next
          steps, feedback, and nudges.
        </p>
      </header>

      <div className="l-card p-3">
        <ChatInput
          error={validationError}
          isSubmitting={startLearningSession.isPending}
          onChange={handlePromptChange}
          onSubmit={handleSubmit}
          value={prompt}
        />
      </div>

      {startLearningSession.isPending ? <LoadingState /> : null}

      {apiError ? (
        <ErrorState
          isRetryable={isLlmUnavailable}
          message={
            isLlmUnavailable
              ? "Your request could not be completed right now. Please try again in a minute."
              : apiError
          }
          onRetry={isLlmUnavailable ? handleRetry : undefined}
        />
      ) : null}

      {response ? (
        <div className="space-y-4">
          <p className="l-readout">generated response</p>
          <ChatResponse response={response} />
        </div>
      ) : null}
    </div>
  );
}

function sessionStateToWorkflow(
  sessionState: SessionState
): LearningSessionResponse | null {
  if (
    sessionState.intent === null &&
    sessionState.learningPlan === null &&
    sessionState.progress === null &&
    sessionState.feedback === null &&
    sessionState.nudges === null &&
    sessionState.currentStage === null
  ) {
    return null;
  }

  return {
    learner_intent: sessionState.intent,
    learning_plan: sessionState.learningPlan,
    progress_report: sessionState.progress,
    feedback_report: sessionState.feedback,
    nudge_report: sessionState.nudges,
    workflow_completed: sessionState.workflowCompleted,
    current_stage: sessionState.currentStage ?? "unknown",
    error_message: sessionState.error,
  };
}
