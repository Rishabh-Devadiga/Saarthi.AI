import {
  CheckCircle2,
  RefreshCw,
  Target,
  XCircle,
} from "lucide-react";

import type { QuizSubmissionResult } from "@/types/quiz";

type QuizResultsProps = {
  isGenerating: boolean;
  onGenerateNew: () => void;
  result: QuizSubmissionResult;
};

export function QuizResults({
  isGenerating,
  onGenerateNew,
  result,
}: QuizResultsProps) {
  return (
    <div className="space-y-6">
      <section className="l-enter pt-4">
        <p className="l-readout">quiz complete</p>
        <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <h1>Your results</h1>
          <button
            className="l-pill l-pill-primary shrink-0"
            disabled={isGenerating}
            onClick={onGenerateNew}
            type="button"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {isGenerating ? "Generating…" : "Generate New Quiz"}
          </button>
        </div>
        <p className="mt-2 max-w-2xl leading-7 text-ink-2">
          Review every answer and use the explanations to strengthen weak
          areas.
        </p>
      </section>

      <section className="grid grid-cols-1 divide-y divide-[color:var(--color-rule)] border border-rule bg-paper-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <ResultMetric label="Score" value={`${result.score}`} />
        <ResultMetric
          label="Percentage"
          value={`${result.percentage}%`}
        />
        <ResultMetric
          label="Questions"
          value={`${result.total_questions}`}
        />
      </section>

      <section className="space-y-3">
        {result.results.map((item) => (
          <article
            className="l-card p-5"
            key={item.question_number}
          >
            <div className="flex gap-3">
              {item.is_correct ? (
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-success"
                  aria-hidden="true"
                />
              ) : (
                <XCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-error"
                  aria-hidden="true"
                />
              )}
              <div className="min-w-0">
                <p className="l-readout">
                  question {item.question_number}
                </p>
                <h2 className="mt-1 leading-7">{item.question}</h2>
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <AnswerDetail
                    label="your answer"
                    value={item.selected_answer}
                  />
                  <AnswerDetail
                    label="correct answer"
                    value={item.correct_answer}
                  />
                </div>
                <div className="l-well mt-4 p-4">
                  <p className="l-readout flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    explanation
                  </p>
                  <p className="mt-2 leading-6 text-ink-2">
                    {item.explanation}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 text-center sm:p-5">
      <p className="font-outlier text-2xl text-ink">{value}</p>
      <p className="l-readout mt-1">{label}</p>
    </div>
  );
}

function AnswerDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="l-well p-3">
      <p className="l-readout">{label}</p>
      <p className="mt-1 font-medium text-ink">{value}</p>
    </div>
  );
}
