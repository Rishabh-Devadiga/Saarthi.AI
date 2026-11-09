import { Check } from "lucide-react";

import { cn } from "@/utils/cn";

type QuizQuestionCardProps = {
  currentQuestion: number;
  onSelect: (answer: string) => void;
  options: string[];
  question: string;
  selectedAnswer: string;
  totalQuestions: number;
};

export function QuizQuestionCard({
  currentQuestion,
  onSelect,
  options,
  question,
  selectedAnswer,
  totalQuestions,
}: QuizQuestionCardProps) {
  return (
    <section className="l-card p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <p className="l-readout text-accent">
          question {currentQuestion + 1}
        </p>
        <p className="l-readout">
          {currentQuestion + 1} of {totalQuestions}
        </p>
      </div>

      <span className="l-meter mt-3 block">
        <span
          className="l-meter-fill"
          style={{
            width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
          }}
        />
      </span>

      <h2 className="mt-6 leading-8">{question}</h2>

      <fieldset className="mt-6 grid gap-3">
        <legend className="sr-only">Choose one answer</legend>
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          return (
            <label
              className={cn(
                "l-choice flex cursor-pointer items-center gap-3 p-4 text-sm",
                isSelected ? "text-ink" : "text-ink-2"
              )}
              key={option}
            >
              <input
                checked={isSelected}
                className="sr-only"
                name={`quiz-question-${currentQuestion}`}
                onChange={() => onSelect(option)}
                type="radio"
                value={option}
              />
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-card)] font-outlier text-xs",
                  isSelected
                    ? "bg-accent text-accent-ink"
                    : "bg-paper-3 text-muted"
                )}
              >
                {isSelected ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </span>
              <span>{option}</span>
            </label>
          );
        })}
      </fieldset>
    </section>
  );
}
