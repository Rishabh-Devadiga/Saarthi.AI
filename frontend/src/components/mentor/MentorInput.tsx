import {
  Bug,
  CircleHelp,
  Lightbulb,
  ListChecks,
  Send,
  Sparkles,
} from "lucide-react";
import { useState, type KeyboardEvent } from "react";

const QUICK_ACTIONS = [
  { label: "Explain Simply", prompt: "Explain this simply.", icon: Lightbulb },
  { label: "Give Example", prompt: "Give me a practical example.", icon: Sparkles },
  {
    label: "Generate Practice Question",
    prompt: "Generate a practice question for me.",
    icon: ListChecks,
  },
  { label: "Debug My Code", prompt: "Help me debug my code.", icon: Bug },
  { label: "What's Next?", prompt: "What should I learn next?", icon: CircleHelp },
];

type MentorInputProps = {
  disabled: boolean;
  onSend: (message: string) => void;
};

export function MentorInput({ disabled, onSend }: MentorInputProps) {
  const [message, setMessage] = useState("");

  function submitMessage() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) {
      return;
    }
    setMessage("");
    onSend(trimmedMessage);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  }

  return (
    <div className="border-t border-rule-2 px-3 py-3 sm:px-5">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {QUICK_ACTIONS.map(({ icon: Icon, label, prompt }) => (
          <button
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rule-2 bg-paper px-3 py-1.5 text-xs text-ink-2 transition-colors hover:border-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            key={label}
            onClick={() => onSend(prompt)}
            type="button"
          >
            <Icon className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-3">
        <textarea
          aria-label="Message AI Mentor"
          className="l-field max-h-36 min-h-12 flex-1 resize-none px-4 py-3 text-sm leading-6 placeholder:text-muted"
          disabled={disabled}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your roadmap or learning…"
          rows={1}
          value={message}
        />
        <button
          aria-label="Send message"
          className="l-pill l-pill-primary h-11 w-11 px-0"
          disabled={disabled || !message.trim()}
          onClick={submitMessage}
          type="button"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
