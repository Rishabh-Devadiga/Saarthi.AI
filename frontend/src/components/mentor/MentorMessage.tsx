import { Bot, User } from "lucide-react";

import { MentorMarkdown } from "@/components/mentor/MentorMarkdown";
import type { MentorMessage as MentorMessageType } from "@/types/mentor";
import { cn } from "@/utils/cn";

type MentorMessageProps = {
  message: MentorMessageType;
};

export function MentorMessage({ message }: MentorMessageProps) {
  const isUser = message.role === "user";

  return (
    <article
      className={cn(
        "flex gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser ? (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-rule-2 bg-paper">
          <Bot className="h-4 w-4 text-muted" aria-hidden="true" />
        </span>
      ) : null}
      <div
        className={cn(
          "max-w-[85%] px-4 py-3 sm:max-w-[78%]",
          isUser
            ? "font-medium leading-6 text-accent-ink bg-accent rounded-[var(--radius-card)]"
            : "border border-rule-2 bg-paper-2 rounded-[var(--radius-card)] leading-7"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MentorMarkdown content={message.content} />
        )}
      </div>
      {isUser ? (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent bg-accent-ink">
          <User className="h-4 w-4 text-accent" aria-hidden="true" />
        </span>
      ) : null}
    </article>
  );
}
