import { ArrowRight, Clock3, Target } from "lucide-react";
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
    <section className="flex h-full min-h-72 flex-col rounded-md border border-white/[0.08] bg-[#1A2235] p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
          <Target className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-bold text-white">Today&apos;s Goal</h2>
          <p className="mt-0.5 text-xs text-slate-400">Recommended next step</p>
        </div>
      </div>

      <div className="mt-6 flex-1">
        <p className="text-base font-bold leading-6 text-white">
          {task ?? "Your next roadmap task will appear here."}
        </p>
        <div className="mt-5 flex items-center gap-2 text-sm text-slate-300">
          <Clock3 className="h-4 w-4 text-blue-400" aria-hidden="true" />
          {estimatedMinutes} min estimated
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Overall progress</span>
            <span className="text-white">{normalizedProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
              style={{ width: `${normalizedProgress}%` }}
            />
          </div>
        </div>
      </div>

      <Link
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5"
        to="/learning-plan"
      >
        Continue Learning
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
