import {
  BookOpenCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  Flame,
  type LucideIcon,
} from "lucide-react";

type QuickStatsProps = {
  completedTopics: number;
  totalTopics: number;
};

export function QuickStats({ completedTopics, totalTopics }: QuickStatsProps) {
  const completion =
    totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
  const stats: Array<{
    detail: string;
    icon: LucideIcon;
    label: string;
    value: string;
  }> = [
    {
      detail: `${completion}% completed`,
      icon: BookOpenCheck,
      label: "topics completed",
      value: `${completedTopics} / ${totalTopics}`,
    },
    {
      detail: "Complete a quiz to begin",
      icon: ClipboardCheck,
      label: "quiz average",
      value: "-",
    },
    {
      detail: "No completed interviews",
      icon: BriefcaseBusiness,
      label: "mock interviews",
      value: "0",
    },
    {
      detail: "Start learning today",
      icon: Flame,
      label: "study streak",
      value: "-",
    },
  ];

  return (
    <section aria-label="Quick stats" className="l-ledger">
      {stats.map(({ detail, icon: Icon, label, value }) => (
        <div className="p-4 sm:p-5" key={label}>
          <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
            <p className="l-readout truncate">{label}</p>
          </div>
          <p className="mt-3 font-[family-name:var(--font-outlier)] text-3xl text-ink">
            {value}
          </p>
          <p className="mt-2 text-xs text-muted">{detail}</p>
        </div>
      ))}
    </section>
  );
}
