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
    <div
      aria-label={`Question ${current} of ${total}`}
      className="space-y-3"
    >
      <div className="flex items-end justify-between gap-4">
        <span className="l-readout">
          question {current} of {total}
        </span>
        <span className="l-readout">
          {percentage}% complete
        </span>
      </div>
      <div
        aria-label={`Progress ${percentage} percent`}
        aria-valuemax={total}
        aria-valuemin={1}
        aria-valuenow={current}
        className="l-meter"
        role="progressbar"
      >
        <span
          className="l-meter-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
