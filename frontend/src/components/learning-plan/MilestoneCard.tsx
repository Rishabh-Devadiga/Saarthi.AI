import { Flag } from "lucide-react";

type MilestoneCardProps = {
  milestones: string[];
};

export function MilestoneCard({ milestones }: MilestoneCardProps) {
  if (milestones.length === 0) {
    return null;
  }

  return (
    <div className="border border-rule bg-paper p-4">
      <p className="l-readout flex items-center gap-2">
        <Flag className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        milestones
      </p>
      <ul className="mt-3">
        {milestones.map((milestone) => (
          <li
            className="border-t border-rule py-2 text-sm leading-6 text-ink-2 first:border-t-0 first:pt-0"
            key={milestone}
          >
            {milestone}
          </li>
        ))}
      </ul>
    </div>
  );
}
