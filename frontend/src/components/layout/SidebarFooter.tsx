import { useSession } from "@/context/SessionContext";

export function SidebarFooter() {
  const { state } = useSession();
  const goal =
    state.intent?.learning_goal ?? state.learningPlan?.learning_goal ?? null;
  const progress = state.progress?.overall_completion_percentage ?? 0;
  const targetDate =
    state.intent?.target_deadline ?? state.learningPlan?.target_deadline ?? null;

  return (
    <footer className="mt-auto border-rule pt-5">
      <div className="border-t border-rule pt-4">
        <p className="l-readout">current goal</p>
        <p className="mt-2 line-clamp-3 min-h-3 text-sm leading-5 text-ink">
          {goal ?? "No active roadmap"}
        </p>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="l-readout">progress</span>
            <span className="l-readout text-ink">{progress}%</span>
          </div>
          <div
            aria-label={`Progress ${progress}%`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress}
            className="l-meter mt-2"
            role="progressbar"
          >
            <div
              className="l-meter-fill"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="l-readout">target completion</p>
          <p className="mt-1 text-sm text-ink-2">{targetDate ?? "Not set"}</p>
        </div>
      </div>
    </footer>
  );
}
