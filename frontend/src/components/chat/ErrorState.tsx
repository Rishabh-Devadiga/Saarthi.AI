import { AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  isRetryable?: boolean;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ isRetryable = false, message, onRetry }: ErrorStateProps) {
  return (
    <section className="l-alert flex gap-3 p-5" role="alert">
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-error"
        aria-hidden="true"
      />
      <div>
        <h2>
          {isRetryable ? "The AI service is temporarily busy" : "Something went wrong"}
        </h2>
        <p className="mt-1 leading-6 text-ink-2">{message}</p>
        {isRetryable && onRetry ? (
          <button
            className="l-pill l-pill-ghost mt-4 h-11 px-5 text-sm"
            onClick={onRetry}
            type="button"
          >
            Retry
          </button>
        ) : null}
      </div>
    </section>
  );
}
