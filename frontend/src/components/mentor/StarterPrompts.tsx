import { Bot, Sparkles } from "lucide-react";

const STARTER_PROMPTS = [
  "Explain Python Dictionaries",
  "How should I study Machine Learning?",
  "Test my understanding of NumPy",
  "Give me a SQL practice question",
];

type StarterPromptsProps = {
  disabled: boolean;
  onSelect: (prompt: string) => void;
};

export function StarterPrompts({
  disabled,
  onSelect,
}: StarterPromptsProps) {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center py-10 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full border border-rule-2 bg-paper">
        <Bot className="h-7 w-7 text-accent" aria-hidden="true" />
      </span>
      <h2 className="mt-5">Meet Saarthi AI</h2>
      <p className="l-caption mt-3 max-w-xl leading-6">
        Ask questions about your roadmap, concepts, coding problems, or anything
        you&apos;re learning.
      </p>
      <div className="mt-7 grid w-full gap-3 sm:grid-cols-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            className="l-choice flex items-start gap-3 p-4 text-left text-sm leading-6 text-ink-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            key={prompt}
            onClick={() => onSelect(prompt)}
            type="button"
          >
            <Sparkles
              className="mt-1 h-4 w-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            {prompt}
          </button>
        ))}
      </div>
    </section>
  );
}
