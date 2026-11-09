import { Library } from "lucide-react";

type ResourceListProps = {
  resources: string[];
};

export function ResourceList({ resources }: ResourceListProps) {
  if (resources.length === 0) {
    return null;
  }

  return (
    <div className="border border-rule bg-paper p-4">
      <p className="l-readout flex items-center gap-2">
        <Library className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        recommended resources
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {resources.map((resource) => (
          <span className="l-tag" key={resource}>
            {resource}
          </span>
        ))}
      </div>
    </div>
  );
}
