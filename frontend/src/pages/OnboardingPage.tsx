import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { buildLearningPrompt } from "@/components/onboarding/formatters";
import { GoalStep } from "@/components/onboarding/GoalStep";
import { LoadingScreen } from "@/components/onboarding/LoadingScreen";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { PreferencesStep } from "@/components/onboarding/PreferencesStep";
import { SkillLevelStep } from "@/components/onboarding/SkillLevelStep";
import { StudyTimeStep } from "@/components/onboarding/StudyTimeStep";
import { TargetDateStep } from "@/components/onboarding/TargetDateStep";
import type {
  LearningPreference,
  OnboardingFormState,
  SkillLevel,
  WizardStep,
} from "@/components/onboarding/types";
import {
  getStepError,
  getTodayInputValue,
  isStepValid,
} from "@/components/onboarding/validation";
import { WizardNavigation } from "@/components/onboarding/WizardNavigation";
import { useAuth } from "@/context/AuthContext";
import { useSession } from "@/context/SessionContext";
import { useStartLearningSession } from "@/hooks/useLearningApi";
import { createRoadmap } from "@/api/roadmapsApi";
import type { JsonValue, LearningSessionResponse } from "@/types/learning";
import { setActiveRoadmap } from "@/utils/activeRoadmap";
import {
  guestRoadmapTitle,
  saveGuestRoadmap,
} from "@/utils/guestRoadmaps";

const initialFormState: OnboardingFormState = {
  goal: "",
  skillLevel: "",
  studyHours: 2,
  targetDate: "",
  preferences: [],
};

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [formState, setFormState] =
    useState<OnboardingFormState>(initialFormState);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const startLearningSession = useStartLearningSession();
  const { saveWorkflow } = useSession();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const today = getTodayInputValue();
  const canContinue = isStepValid(currentStep, formState, today);

  function updateGoal(goal: string) {
    setFormState((current) => ({ ...current, goal }));
    setValidationError(null);
  }

  function updateSkillLevel(skillLevel: SkillLevel) {
    setFormState((current) => ({ ...current, skillLevel }));
    setValidationError(null);
  }

  function updateStudyHours(studyHours: number) {
    setFormState((current) => ({ ...current, studyHours }));
  }

  function updateTargetDate(targetDate: string) {
    setFormState((current) => ({ ...current, targetDate }));
    setValidationError(null);
  }

  function togglePreference(preference: LearningPreference) {
    setFormState((current) => ({
      ...current,
      preferences: current.preferences.includes(preference)
        ? current.preferences.filter((item) => item !== preference)
        : [...current.preferences, preference],
    }));
    setValidationError(null);
  }

  function handleNext() {
    const error = getStepError(currentStep, formState, today);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    setCurrentStep((current) => Math.min(current + 1, 5) as WizardStep);
  }

  function handleBack() {
    setValidationError(null);
    setSubmissionError(null);
    setCurrentStep((current) => Math.max(current - 1, 1) as WizardStep);
  }

  function handleSubmit() {
    const error = getStepError(5, formState, today);
    if (error) {
      setValidationError(error);
      return;
    }

    setSubmissionError(null);
    startLearningSession.mutate(
      {
        user_name: "Saarthi Learner",
        email: null,
        prompt: buildLearningPrompt(formState),
      },
      {
        onSuccess: (response) => {
          saveWorkflow(response.data);
          void persistNewRoadmap(response.data, formState.goal);
        },
        onError: (requestError) => {
          setSubmissionError(requestError.message);
        },
      }
    );
  }

  async function persistNewRoadmap(
    workflow: LearningSessionResponse,
    goal: string
  ) {
    const title = guestRoadmapTitle(
      workflow.learning_plan?.learning_goal ?? goal
    );
    const session = workflow as unknown as Record<string, JsonValue>;
    if (isAuthenticated) {
      try {
        const saved = await createRoadmap({
          title,
          goal: goal.trim() || null,
          session,
          resources: {},
          progress: { completedTopics: {} },
          quiz: [],
        });
        setActiveRoadmap({ id: String(saved.data.id), source: "server" });
        navigate(`/learning-plan?roadmap=${saved.data.id}&source=server`);
      } catch {
        // Server save failed (e.g. expired session): keep the roadmap as a
        // guest copy so the generated plan is never lost.
        const guest = saveGuestRoadmap({
          title,
          goal: goal.trim() || null,
          session,
          resources: {},
          completedTopics: {},
          quizAttempts: [],
        });
        setActiveRoadmap({ id: guest.id, source: "guest" });
        navigate(`/learning-plan?roadmap=${guest.id}&source=guest`);
      }
      return;
    }
    const guest = saveGuestRoadmap({
      title,
      goal: goal.trim() || null,
      session,
      resources: {},
      completedTopics: {},
      quizAttempts: [],
    });
    setActiveRoadmap({ id: guest.id, source: "guest" });
    navigate(`/learning-plan?roadmap=${guest.id}&source=guest`);
  }

  if (startLearningSession.isPending) {
    return <LoadingScreen />;
  }

  return (
    <OnboardingLayout currentStep={currentStep}>
      {submissionError ? (
        <div
          className="flex items-start gap-3 border-b border-rose-300/15 bg-rose-400/10 px-5 py-4 text-sm text-rose-100 sm:px-8"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{submissionError}</span>
        </div>
      ) : null}

      <div
        className="onboarding-step min-h-[440px] px-5 py-7 sm:px-8 sm:py-9"
        key={currentStep}
      >
        {currentStep === 1 ? (
          <GoalStep
            error={validationError}
            onChange={updateGoal}
            value={formState.goal}
          />
        ) : null}
        {currentStep === 2 ? (
          <SkillLevelStep
            error={validationError}
            onChange={updateSkillLevel}
            value={formState.skillLevel}
          />
        ) : null}
        {currentStep === 3 ? (
          <StudyTimeStep
            onChange={updateStudyHours}
            value={formState.studyHours}
          />
        ) : null}
        {currentStep === 4 ? (
          <TargetDateStep
            error={validationError}
            minDate={today}
            onChange={updateTargetDate}
            value={formState.targetDate}
          />
        ) : null}
        {currentStep === 5 ? (
          <PreferencesStep
            error={validationError}
            onToggle={togglePreference}
            values={formState.preferences}
          />
        ) : null}
      </div>

      {currentStep === 5 ? (
        <p className="px-5 pb-1 pt-2 text-center text-sm font-semibold tracking-wide text-teal-200 sm:px-8">
          Your journey starts here.
        </p>
      ) : null}
      <WizardNavigation
        canContinue={canContinue}
        currentStep={currentStep}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </OnboardingLayout>
  );
}
