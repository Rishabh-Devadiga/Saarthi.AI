import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/common/Button";
import { InterviewProgress } from "@/components/interview/InterviewProgress";
import { InterviewQuestionCard } from "@/components/interview/InterviewQuestionCard";
import type { InterviewQuestion } from "@/types/interview";

type InterviewSessionProps = {
  feedback: string | null;
  isLoading: boolean;
  onSubmit: (answer: string) => void;
  question: InterviewQuestion;
};

export function InterviewSession({
  feedback,
  isLoading,
  onSubmit,
  question,
}: InterviewSessionProps) {
  const [answer, setAnswer] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer || isLoading) {
      return;
    }
    onSubmit(trimmedAnswer);
    setAnswer("");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <InterviewProgress
          current={question.question_number}
          total={question.total_questions}
        />
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

      <form
        className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        onSubmit={handleSubmit}
      >
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">
            Your Answer
          </span>
          <textarea
            autoFocus
            className="mt-2 min-h-44 w-full resize-y rounded-md border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            disabled={isLoading}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Explain your answer clearly and concisely..."
            value={answer}
          />
        </label>
        <div className="mt-4 flex justify-end">
          <Button disabled={!answer.trim() || isLoading} type="submit">
            <Send className="h-4 w-4" aria-hidden="true" />
            {isLoading ? "Recording..." : "Submit Answer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
