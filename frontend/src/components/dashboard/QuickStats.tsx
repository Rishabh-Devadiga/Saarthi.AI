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

export function QuickStats({
  completedTopics,
  totalTopics,
}: QuickStatsProps) {
  const completion =
    totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
  const stats: Array<{
    accent: string;
    detail: string;
    icon: LucideIcon;
    label: string;
    value: string;
  }> = [
    {
      accent: "from-blue-500 to-violet-500",
      detail: `${completion}% completed`,
      icon: BookOpenCheck,
      label: "Topics Completed",
      value: `${completedTopics} / ${totalTopics}`,
    },
    {
      accent: "from-emerald-500 to-teal-500",
      detail: "Complete a quiz to begin",
      icon: ClipboardCheck,
      label: "Quiz Average",
      value: "—",
    },
    {
      accent: "from-amber-500 to-orange-500",
      detail: "No completed interviews",
      icon: BriefcaseBusiness,
      label: "Mock Interviews",
      value: "0",
    },
    {
      accent: "from-fuchsia-500 to-violet-500",
      detail: "Start learning today",
      icon: Flame,
      label: "Study Streak",
      value: "—",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ accent, detail, icon: Icon, label, value }) => (
        <article
          className="min-h-36 rounded-md border border-white/[0.08] bg-[#1A2235] p-5 shadow-sm transition hover:-translate-y-1 hover:border-white/[0.14]"
          key={label}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br ${accent} text-white`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-slate-300">{label}</p>
          </div>
          <p className="mt-4 text-2xl font-bold text-white">{value}</p>
          <p className="mt-2 text-xs font-medium text-slate-400">{detail}</p>
        </article>
      ))}
    </section>
  );
}
