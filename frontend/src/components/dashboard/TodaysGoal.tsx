import { ArrowRight, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";

type TodaysGoalProps = {
  estimatedMinutes: number;
  progress: number;
  task: string | null;
};

export function TodaysGoal({
  estimatedMinutes,
  progress,
  task,
}: TodaysGoalProps) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <section className="l-card flex h-full flex-col p-5">
      <p className="l-readout">today's plan</p>
      <h2 className="mt-2">Today&apos;s Goal</h2>

      <div
        aria-label={`Today's progress: ${normalizedProgress} percent`}
        className="mx-auto mt-6 grid h-36 w-36 place-items-center rounded-full"
        role="img"
        style={{
          background: `conic-gradient(var(--color-accent) ${normalizedProgress * 3.6}deg, var(--color-paper-3) 0deg)`,
        }}
      >
        <div className="grid h-28 w-28 place-items-center rounded-full border border-rule bg-paper text-center">
          <p className="font-outlier text-3xl text-ink">{normalizedProgress}%</p>
        </div>
      </div>

      <p className="mt-6 leading-6 text-ink">
        {task ?? "Your next roadmap task will appear here."}
      </p>
      <p className="l-readout mt-3 flex items-center gap-2">
        <Clock3 className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
        {estimatedMinutes} min estimated
      </p>

      <Link
        className="l-pill l-pill-primary mt-6 w-full"
        to="/learning-plan"
      >
        Continue Learning
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
