import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function LoadingState() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const attempt = Math.min(3, Math.floor(elapsedSeconds / 20) + 1);
  const isRetryWindow = attempt > 1;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsedSeconds((currentValue) => currentValue + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="l-card p-5">
      <div className="flex items-start gap-3">
        <LoaderCircle
          className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-accent"
          aria-hidden="true"
        />
        <div>
          <h2>
            {isRetryWindow
              ? `Retrying AI generation… Attempt ${attempt} of 3`
              : "Generating your learning plan…"}
          </h2>
          <p className="l-caption mt-1 leading-6">
            {isRetryWindow
              ? "The AI service may be temporarily busy. We are keeping your request active."
              : "The AI Learning Agent is reading your goal and building a roadmap."}
          </p>
        </div>
      </div>
    </section>
  );
}
