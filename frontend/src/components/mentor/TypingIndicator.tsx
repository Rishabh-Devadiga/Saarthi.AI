import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-rule-2 bg-paper">
        <Bot className="h-4 w-4 text-muted" aria-hidden="true" />
      </span>
      <div className="l-readout flex items-center gap-3 border border-rule-2 bg-paper-2 px-4 py-3 rounded-[var(--radius-card)]">
        <span className="flex gap-1" aria-hidden="true">
          {[0, 1, 2].map((item) => (
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
              key={item}
              style={{ animationDelay: `${item * 150}ms` }}
            />
          ))}
        </span>
        Saarthi AI is thinking…
      </div>
    </div>
  );
}
