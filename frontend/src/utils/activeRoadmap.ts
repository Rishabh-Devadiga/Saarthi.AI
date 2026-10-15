import type { RoadmapSource } from "@/types/roadmaps";

export type ActiveRoadmap = {
  id: string;
  source: RoadmapSource;
};

const ACTIVE_ROADMAP_KEY = "saarthi-active-roadmap";

export function setActiveRoadmap(active: ActiveRoadmap | null): void {
  try {
    if (active) {
      sessionStorage.setItem(ACTIVE_ROADMAP_KEY, JSON.stringify(active));
    } else {
      sessionStorage.removeItem(ACTIVE_ROADMAP_KEY);
    }
  } catch {
    // Non-fatal: quiz/progress sync simply won't attach to a roadmap.
  }
}

export function getActiveRoadmap(): ActiveRoadmap | null {
  try {
    const raw = sessionStorage.getItem(ACTIVE_ROADMAP_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("id" in parsed) ||
      !("source" in parsed)
    ) {
      return null;
    }
    const { id, source } = parsed as { id: unknown; source: unknown };
    if (typeof id !== "string" || (source !== "server" && source !== "guest")) {
      return null;
    }
    return { id, source };
  } catch {
    return null;
  }
}
