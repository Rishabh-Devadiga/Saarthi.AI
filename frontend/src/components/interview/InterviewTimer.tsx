import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

import { formatElapsedTime } from "@/utils/interview";

type InterviewTimerProps = {
  startedAt: number;
};

export function InterviewTimer({ startedAt }: InterviewTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    getElapsedSeconds(startedAt)
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(getElapsedSeconds(startedAt));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  return (
    <div className="l-readout inline-flex h-11 w-max items-center gap-2 rounded-[var(--radius-card)] border border-rule-2 bg-paper px-4">
      <Clock3 className="h-4 w-4 text-accent" aria-hidden="true" />
      {formatElapsedTime(elapsedSeconds)}
    </div>
  );
}

function getElapsedSeconds(startedAt: number): number {
  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}
