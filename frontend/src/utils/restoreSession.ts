import type { SessionState } from "@/context/sessionTypes";
import type { JsonValue } from "@/types/learning";

export type RestorableSnapshot = {
  session: Record<string, JsonValue> | null;
  progress: Record<string, JsonValue>;
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function synthesizeProgressReport(
  plan: NonNullable<SessionState["learningPlan"]>
): SessionState["progress"] {
  const topics = plan.phases.flatMap((phase) => phase.recommended_topics);
  const firstPhase = plan.phases[0]?.phase_number ?? 1;
  return {
    current_phase: firstPhase,
    overall_completion_percentage: 0,
    completed_topics: [],
    remaining_topics: topics,
    completed_milestones: [],
    next_recommended_task: topics[0]
      ? `Continue ${topics[0]}`
      : `Complete final milestone: ${plan.final_milestone}`,
    learner_status: "On Track",
    summary: "Restored roadmap with fresh progress tracking.",
  };
}

/** Rebuild a full session state from a saved roadmap snapshot. */

export function buildSessionStateFromSnapshot(
  snapshot: RestorableSnapshot
): SessionState {
  const session = asRecord(snapshot.session);
  const progress = asRecord(snapshot.progress);
  const learningPlan = (session.learning_plan ??
    session.learningPlan ??
    null) as SessionState["learningPlan"];
  let progressReport = (session.progress_report ??
    session.progress ??
    null) as SessionState["progress"];
  if (!progressReport && learningPlan) {
    progressReport = synthesizeProgressReport(learningPlan);
  }
  return {
    user: null,
    intent: (session.learner_intent ?? session.intent ?? null) as SessionState["intent"],
    learningPlan,
    progress: progressReport,
    feedback: (session.feedback_report ??
      session.feedback ??
      null) as SessionState["feedback"],
    nudges: (session.nudge_report ?? session.nudges ?? null) as SessionState["nudges"],
    workflowCompleted: Boolean(session.workflow_completed ?? true),
    currentStage: (session.current_stage as string | null) ?? "completed",
    isLoading: false,
    error: (session.error_message as string | null) ?? null,
    completedTopics: (progress.completedTopics ?? {}) as Record<string, boolean>,
    calendar: { connected: false, connectionId: null },
    generatedSchedule: [],
    upcomingStudySession: null,
  };
}
