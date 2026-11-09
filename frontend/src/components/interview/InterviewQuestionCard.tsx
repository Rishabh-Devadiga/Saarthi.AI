import { MessageSquareText } from "lucide-react";

import type { InterviewQuestion } from "@/types/interview";

type InterviewQuestionCardProps = {
  question: InterviewQuestion;
};

export function InterviewQuestionCard({
  question,
}: InterviewQuestionCardProps) {
  return (
    <article className="l-card p-5 sm:p-7">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-rule bg-paper">
          <MessageSquareText
            className="h-5 w-5 text-accent"
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0">
          <p className="l-readout">interview question</p>
          <h2 className="mt-2 leading-8">{question.question}</h2>
        </div>
      </div>
    </article>
  );
}
