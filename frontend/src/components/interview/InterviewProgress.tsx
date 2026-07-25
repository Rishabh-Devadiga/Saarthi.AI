type InterviewProgressProps = {
  current: number;
  total: number;
};

export function InterviewProgress({
  current,
  total,
}: InterviewProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div aria-label={`Question ${current} of ${total}`} className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">
          Question {current} of {total}
        </span>
        <span className="text-slate-500">{percentage}%</span>
      </div>
      <div
        aria-valuemax={total}
        aria-valuemin={1}
        aria-valuenow={current}
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-[width] duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
