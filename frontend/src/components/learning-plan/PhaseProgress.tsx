type PhaseProgressProps = {
  completedCount: number;
  totalCount: number;
};

export function PhaseProgress({ completedCount, totalCount }: PhaseProgressProps) {
  if (totalCount === 0) {
    return null;
  }

  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div
      aria-label={`Phase progress ${completedCount} of ${totalCount} topics`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={percentage}
      role="progressbar"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="l-readout">phase progress</p>
        <p className="l-readout text-ink">
          {completedCount}/{totalCount} topics
        </p>
      </div>
      <div className="l-meter mt-2">
        <div
          className="l-meter-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
