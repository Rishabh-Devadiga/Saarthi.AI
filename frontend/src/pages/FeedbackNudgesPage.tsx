import { EmptyFeedback } from "@/components/feedback/EmptyFeedback";
import { FeedbackHeader } from "@/components/feedback/FeedbackHeader";
import { FeedbackSummary } from "@/components/feedback/FeedbackSummary";
import { ImprovementsCard } from "@/components/feedback/ImprovementsCard";
import { NudgeCard } from "@/components/feedback/NudgeCard";
import { RecommendationsCard } from "@/components/feedback/RecommendationsCard";
import { StrengthsCard } from "@/components/feedback/StrengthsCard";
import { StudyInsights } from "@/components/feedback/StudyInsights";
import { useSession } from "@/context/SessionContext";

export function FeedbackNudgesPage() {
  const { state } = useSession();
  const feedback = state.feedback;
  const nudge = state.nudges;

  if (!feedback && !nudge) {
    return <EmptyFeedback />;
  }

  const currentGoal =
    state.intent?.learning_goal ?? state.learningPlan?.learning_goal ?? null;
  const subject = state.intent?.subject ?? state.learningPlan?.subject ?? null;
  const recommendedFocus =
    feedback?.next_study_session_focus ??
    state.progress?.next_recommended_task ??
    nudge?.recommended_action ??
    null;

  return (
    <div className="space-y-5">
      <FeedbackHeader
        currentStage={state.currentStage}
        goal={currentGoal}
        subject={subject}
        workflowCompleted={state.workflowCompleted}
      />

      <div className="grid items-stretch gap-5 md:grid-cols-2 [&>*:only-child]:md:col-span-2">
        <FeedbackSummary
          confidenceLevel={null}
          motivationMessage={feedback?.motivation_message ?? null}
          summary={feedback?.overall_performance_assessment ?? null}
        />
        <NudgeCard
          message={nudge?.personalized_message ?? null}
          recommendedAction={nudge?.recommended_action ?? null}
          urgency={nudge?.urgency ?? null}
        />
      </div>

      <div className="grid items-stretch gap-5 md:grid-cols-2 [&>*:only-child]:md:col-span-2">
        <StrengthsCard strengths={feedback?.strengths ?? []} />
        <ImprovementsCard
          improvements={feedback?.areas_for_improvement ?? []}
        />
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-2 [&>*:only-child]:lg:col-span-2">
        <RecommendationsCard
          recommendations={feedback?.personalized_study_recommendations ?? []}
        />
        <StudyInsights
          completionPercentage={
            state.progress?.overall_completion_percentage ?? null
          }
          currentGoal={currentGoal}
          currentPhase={state.progress?.current_phase ?? null}
          progressStatus={
            state.progress?.learner_status ?? nudge?.learner_status ?? null
          }
          recommendedFocus={recommendedFocus}
        />
      </div>
    </div>
  );
}
