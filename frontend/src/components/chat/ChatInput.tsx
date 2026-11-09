import { SendHorizontal } from "lucide-react";

type ChatInputProps = {
  error: string | null;
  isSubmitting: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  value: string;
};

export function ChatInput({
  error,
  isSubmitting,
  onChange,
  onSubmit,
  value,
}: ChatInputProps) {
  return (
    <section className="border border-rule bg-paper-2 p-4 sm:p-5">
      <label className="l-readout block" htmlFor="learning-goal">
        Describe your learning goal
      </label>
      <textarea
        className="l-field mt-3 min-h-40 w-full resize-y px-4 py-3 text-sm leading-7 placeholder:text-muted sm:min-h-44"
        disabled={isSubmitting}
        id="learning-goal"
        onChange={(event) => onChange(event.target.value)}
        placeholder='Example: "I want to become a Data Scientist in 6 months with 2 hours of study every day."'
        value={value}
      />
      {error ? <p className="l-field-note mt-2">{error}</p> : null}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="l-caption">
          Include your target role, current level, timeline, and study time.
        </p>
        <button
          className="l-pill l-pill-primary"
          disabled={isSubmitting}
          onClick={onSubmit}
          type="button"
        >
          {isSubmitting ? (
            "Generating your learning plan…"
          ) : (
            <>
              <SendHorizontal className="h-4 w-4" aria-hidden="true" />
              Generate Learning Plan
            </>
          )}
        </button>
      </div>
    </section>
  );
}
