import { BriefcaseBusiness, Clock3, Play } from "lucide-react";
import { useState, type FormEvent } from "react";

import type {
  InterviewDifficulty,
  InterviewStartRequest,
} from "@/types/interview";
import { cn } from "@/utils/cn";

const DIFFICULTIES: InterviewDifficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];
const QUESTION_COUNTS = [5, 10, 15] as const;

type InterviewSetupProps = {
  isLoading: boolean;
  learningGoal: string;
  onStart: (request: InterviewStartRequest) => void;
};

export function InterviewSetup({
  isLoading,
  learningGoal,
  onStart,
}: InterviewSetupProps) {
  const [interviewRole, setInterviewRole] = useState(
    getDefaultRole(learningGoal)
  );
  const [difficulty, setDifficulty] =
    useState<InterviewDifficulty>("Intermediate");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedRole = interviewRole.trim();
    if (trimmedRole.length < 3) {
      return;
    }

    onStart({
      learning_goal: learningGoal,
      interview_role: trimmedRole,
      difficulty,
      number_of_questions: numberOfQuestions,
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <section className="l-enter pt-4">
        <p className="l-readout flex items-center gap-2">
          <BriefcaseBusiness
            className="h-3.5 w-3.5 text-accent"
            aria-hidden="true"
          />
          practice workspace
        </p>
        <h1 className="mt-2">Mock Interview</h1>
        <p className="mt-3 max-w-3xl leading-7 text-ink-2">
          Configure a focused text interview based on your current learning
          goal.
        </p>
      </section>

      <section className="l-card space-y-6 p-5 sm:p-7">
        <Field label="Learning Goal">
          <input
            className="l-field text-sm text-ink-2 read-only:opacity-70"
            readOnly
            value={learningGoal}
          />
        </Field>

        <Field label="Interview Role">
          <input
            className="l-field text-sm text-ink"
            maxLength={100}
            minLength={3}
            onChange={(event) => setInterviewRole(event.target.value)}
            placeholder="e.g. Data Scientist"
            required
            value={interviewRole}
          />
        </Field>

        <Field label="Difficulty">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {DIFFICULTIES.map((option) => (
              <button
                aria-pressed={difficulty === option}
                className={cn(
                  "l-choice px-4 py-3 text-sm",
                  difficulty === option ? "text-ink" : "text-ink-2"
                )}
                key={option}
                onClick={() => setDifficulty(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Number of Questions">
          <div className="grid grid-cols-3 gap-3">
            {QUESTION_COUNTS.map((count) => (
              <button
                aria-pressed={numberOfQuestions === count}
                className={cn(
                  "l-choice px-4 py-3 text-sm",
                  numberOfQuestions === count ? "text-ink" : "text-ink-2"
                )}
                key={count}
                onClick={() => setNumberOfQuestions(count)}
                type="button"
              >
                {count}
              </button>
            ))}
          </div>
        </Field>

        <div className="flex flex-col gap-4 border-t border-rule pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="l-readout flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-accent" aria-hidden="true" />
            Estimated duration: {numberOfQuestions * 2} minutes
          </p>
          <button
            className="l-pill l-pill-primary"
            disabled={isLoading || interviewRole.trim().length < 3}
            type="submit"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {isLoading ? "Starting…" : "Start Interview"}
          </button>
        </div>
      </section>
    </form>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="l-readout">{label}</span>
      {children}
    </label>
  );
}

function getDefaultRole(learningGoal: string): string {
  return learningGoal
    .replace(/^i want to\s+/i, "")
    .replace(/^become\s+(?:a|an)\s+/i, "")
    .replace(/^learn\s+/i, "")
    .replace(/[.!?]+$/, "")
    .trim()
    .slice(0, 100);
}
