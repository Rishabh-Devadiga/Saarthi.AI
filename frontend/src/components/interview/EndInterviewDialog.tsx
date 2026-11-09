import { AlertTriangle } from "lucide-react";

type EndInterviewDialogProps = {
  isEnding: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
};

export function EndInterviewDialog({
  isEnding,
  onCancel,
  onConfirm,
  open,
}: EndInterviewDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      aria-labelledby="end-interview-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-[color-mix(in_oklab,var(--color-paper)_75%,black)] p-4"
      role="dialog"
    >
      <section className="l-card l-enter w-full max-w-md p-6">
        <span className="grid h-11 w-11 place-items-center rounded-full border border-rule bg-paper">
          <AlertTriangle
            className="h-5 w-5 text-error"
            aria-hidden="true"
          />
        </span>
        <h2 className="mt-4" id="end-interview-title">
          End this interview?
        </h2>
        <p className="l-caption mt-2 leading-6">
          Your submitted answers will be summarized. The current unanswered
          question will not be included.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="l-pill l-pill-ghost"
            disabled={isEnding}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="l-pill l-pill-primary"
            disabled={isEnding}
            onClick={onConfirm}
            type="button"
          >
            {isEnding ? "Ending…" : "End Interview"}
          </button>
        </div>
      </section>
    </div>
  );
}
