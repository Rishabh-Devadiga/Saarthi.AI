import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyQuiz } from "@/components/quiz/EmptyQuiz";
import { QuizLoading } from "@/components/quiz/QuizLoading";
import { QuizQuestionCard } from "@/components/quiz/QuizQuestionCard";
import { QuizResults } from "@/components/quiz/QuizResults";
import { useSession } from "@/context/SessionContext";
import { useGenerateQuiz, useSubmitQuiz } from "@/hooks/useQuizApi";
import { getRoadmap, updateRoadmap } from "@/api/roadmapsApi";
import type { GeneratedQuiz, QuizSubmissionResult } from "@/types/quiz";
import { getActiveRoadmap } from "@/utils/activeRoadmap";
import { getGuestRoadmap, saveGuestRoadmap } from "@/utils/guestRoadmaps";

const DEFAULT_DIFFICULTY = "Intermediate";
const DEFAULT_QUESTION_COUNT = 5;

export function QuizPage() {
  const { state } = useSession();
  const plan = state.learningPlan;
  const generateMutation = useGenerateQuiz();
  const submitMutation = useSubmitQuiz();
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const topics = useMemo(
    () =>
      Array.from(
        new Set(
          plan?.phases.flatMap((phase) => phase.recommended_topics) ?? []
        )
      ),
    [plan]
  );

  if (!plan) {
    return <EmptyQuiz />;
  }

  async function handleGenerateQuiz() {
    generateMutation.reset();
    submitMutation.reset();
    setQuiz(null);
    setResult(null);
    setSelectedAnswers([]);
    setCurrentQuestion(0);

    try {
      const response = await generateMutation.mutateAsync({
        topics,
        difficulty: DEFAULT_DIFFICULTY,
        number_of_questions: DEFAULT_QUESTION_COUNT,
      });
      setQuiz(response.data);
      setSelectedAnswers(
        Array.from({ length: response.data.questions.length }, () => "")
      );
    } catch {
      // Mutation state renders the API error.
    }
  }

  function handleSelectAnswer(answer: string) {
    setSelectedAnswers((currentAnswers) =>
      currentAnswers.map((currentAnswer, index) =>
        index === currentQuestion ? answer : currentAnswer
      )
    );
  }

  async function handleSubmitQuiz() {
    if (!quiz || selectedAnswers.some((answer) => !answer)) {
      return;
    }

    submitMutation.reset();
    try {
      const response = await submitMutation.mutateAsync({
        generated_quiz: quiz,
        selected_answers: selectedAnswers,
      });
      setResult(response.data);
      void persistQuizAttempt(response.data);
    } catch {
      // Mutation state renders the API error.
    }
  }

  async function persistQuizAttempt(result: QuizSubmissionResult) {
    const active = getActiveRoadmap();
    if (!active) {
      return;
    }
    const attempt = {
      topic: plan?.learning_goal ?? topics[0] ?? "General",
      score: result.score,
      total: result.total_questions,
      takenAt: new Date().toISOString(),
    };
    try {
      if (active.source === "server") {
        const roadmapId = Number(active.id);
        if (!Number.isInteger(roadmapId) || roadmapId <= 0) {
          return;
        }
        const current = await getRoadmap(roadmapId);
        const quiz = Array.isArray(current.data.quiz) ? current.data.quiz : [];
        await updateRoadmap(roadmapId, { quiz: [...quiz, attempt] });
        return;
      }
      const guest = getGuestRoadmap(active.id);
      if (guest) {
        saveGuestRoadmap({ ...guest, quizAttempts: [...guest.quizAttempts, attempt] });
      }
    } catch {
      // Attempt persistence is best-effort; the result is already on screen.
    }
  }

  if (generateMutation.isPending) {
    return <QuizLoading />;
  }

  if (result) {
    return (
      <QuizResults
        isGenerating={generateMutation.isPending}
        onGenerateNew={() => void handleGenerateQuiz()}
        result={result}
      />
    );
  }

  if (!quiz) {
    return (
      <div className="space-y-6">
        <QuizHeader goal={plan.learning_goal} topicCount={topics.length} />
        {generateMutation.error ? (
          <QuizError message={generateMutation.error.message} />
        ) : null}
        <section className="l-card p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <QuizSetting label="Difficulty" value={DEFAULT_DIFFICULTY} />
            <QuizSetting
              label="Questions"
              value={`${DEFAULT_QUESTION_COUNT}`}
            />
            <QuizSetting label="Roadmap Topics" value={`${topics.length}`} />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              className="l-pill l-pill-primary"
              disabled={topics.length === 0}
              onClick={() => void handleGenerateQuiz()}
              type="button"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Generate Quiz
            </button>
          </div>
          {topics.length === 0 ? (
            <p className="l-caption mt-3 text-right">
              The current learning plan does not contain any quiz topics.
            </p>
          ) : null}
        </section>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const allQuestionsAnswered = selectedAnswers.every(Boolean);
  const isFinalQuestion = currentQuestion === quiz.questions.length - 1;

  return (
    <div className="space-y-5">
      <QuizHeader goal={plan.learning_goal} topicCount={quiz.topics.length} />
      {submitMutation.error ? (
        <QuizError message={submitMutation.error.message} />
      ) : null}
      <QuizQuestionCard
        currentQuestion={currentQuestion}
        onSelect={handleSelectAnswer}
        options={question.options}
        question={question.question}
        selectedAnswer={selectedAnswers[currentQuestion] ?? ""}
        totalQuestions={quiz.questions.length}
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          className="l-pill l-pill-ghost"
          disabled={currentQuestion === 0 || submitMutation.isPending}
          onClick={() =>
            setCurrentQuestion((currentValue) => currentValue - 1)
          }
          type="button"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </button>

        {isFinalQuestion ? (
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <button
              className="l-pill l-pill-primary"
              disabled={!allQuestionsAnswered || submitMutation.isPending}
              onClick={() => void handleSubmitQuiz()}
              type="button"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {submitMutation.isPending ? "Submitting…" : "Submit Quiz"}
            </button>
            {!allQuestionsAnswered ? (
              <p className="l-caption">Answer every question before submitting.</p>
            ) : null}
          </div>
        ) : (
          <button
            className="l-pill l-pill-primary"
            disabled={submitMutation.isPending}
            onClick={() =>
              setCurrentQuestion((currentValue) => currentValue + 1)
            }
            type="button"
          >
            Next
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

function QuizHeader({
  goal,
  topicCount,
}: {
  goal: string;
  topicCount: number;
}) {
  return (
    <section className="l-enter pt-4">
      <p className="l-readout">knowledge check</p>
      <h1 className="mt-2">Quiz</h1>
      <p className="mt-3 max-w-3xl leading-7 text-ink-2">
        Test your understanding of {goal} across {topicCount} roadmap{" "}
        {topicCount === 1 ? "topic" : "topics"}.
      </p>
    </section>
  );
}

function QuizSetting({ label, value }: { label: string; value: string }) {
  return (
    <div className="l-well p-4">
      <p className="l-readout">{label}</p>
      <p className="mt-2 font-outlier text-xl text-ink">{value}</p>
    </div>
  );
}

function QuizError({ message }: { message: string }) {
  return (
    <section className="l-alert flex gap-3 p-4" role="alert">
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-error"
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-medium text-ink">Quiz request failed</p>
        <p className="mt-1 leading-6 text-ink-2">{message}</p>
      </div>
    </section>
  );
}
