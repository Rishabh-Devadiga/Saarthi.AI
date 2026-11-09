import { CheckCircle2, CircleDashed } from "lucide-react";

type CalendarStatusProps = {
  connected: boolean;
};

export function CalendarStatus({ connected }: CalendarStatusProps) {
  return (
    <div className="mt-1 flex items-center gap-2 text-sm">
      {connected ? (
        <>
          <CheckCircle2
            className="h-4 w-4 text-accent"
            aria-hidden="true"
          />
          <span className="text-ink-2">Connected</span>
        </>
      ) : (
        <>
          <CircleDashed
            className="h-4 w-4 text-muted"
            aria-hidden="true"
          />
          <span className="text-muted">Not Connected</span>
        </>
      )}
    </div>
  );
}
