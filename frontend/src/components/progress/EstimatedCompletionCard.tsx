import { AlertCircle, CalendarCheck2, CalendarClock, Clock3 } from "lucide-react";

export type CompletionEstimate = {
  daysRemaining: number | null;
  estimatedCompletionDate: Date | null;
  message: string | null;
  status: "On Track" | "Behind Schedule" | null;
  targetDate: Date | null;
};

type EstimatedCompletionCardProps = {
  estimate: CompletionEstimate;
};

export function EstimatedCompletionCard({
  estimate,
}: EstimatedCompletionCardProps) {
  const isBehind = estimate.status === "Behind Schedule";

  return (
    <section className="l-card p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-rule bg-paper">
            <CalendarCheck2
              className="h-5 w-5 text-accent"
              aria-hidden="true"
            />
          </span>
          <div>
            <p className="l-readout">estimated completion</p>
            <h2 className="mt-1">
              {estimate.estimatedCompletionDate
                ? formatDate(estimate.estimatedCompletionDate)
                : "Estimate not available yet"}
            </h2>
            {estimate.message ? (
              <p className="l-caption mt-2 max-w-2xl leading-6">
                {estimate.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
          <EstimateMetric
            icon={CalendarClock}
            label="Target Completion"
            value={estimate.targetDate ? formatDate(estimate.targetDate) : "Not set"}
          />
          <EstimateMetric
            icon={Clock3}
            label="Days Remaining"
            value={
              estimate.daysRemaining === null
                ? "Unavailable"
                : String(Math.max(estimate.daysRemaining, 0))
            }
          />
          <div className="l-well p-4">
            <p className="l-readout flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted" aria-hidden="true" />
              Status
            </p>
            <p
              className={`mt-2 text-sm font-medium ${
                estimate.status === null
                  ? "text-ink-2"
                  : isBehind
                    ? "text-error"
                    : "text-success"
              }`}
            >
              {estimate.status ?? "Pending estimate"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type EstimateMetricProps = {
  icon: typeof Clock3;
  label: string;
  value: string;
};

function EstimateMetric({ icon: Icon, label, value }: EstimateMetricProps) {
  return (
    <div className="l-well p-4">
      <p className="l-readout flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
