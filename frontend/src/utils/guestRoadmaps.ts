import type { YouTubeVideo } from "@/services/youtubeService";
import type { JsonValue } from "@/types/learning";
import type { RoadmapSnapshot } from "@/types/roadmaps";

export type GuestQuizAttempt = {
  topic: string;
  score: number | null;
  total: number | null;
  takenAt: string;
};

export type GuestRoadmap = {
  id: string;
  title: string;
  goal: string | null;
  createdAt: string;
  updatedAt: string;
  session: Record<string, JsonValue> | null;
  resources: Record<string, YouTubeVideo[]>;
  completedTopics: Record<string, boolean>;
  quizAttempts: GuestQuizAttempt[];
};

type GuestRoadmapInput = Omit<GuestRoadmap, "id" | "createdAt" | "updatedAt"> &
  Partial<Pick<GuestRoadmap, "id" | "createdAt" | "updatedAt">>;

const GUEST_STORAGE_KEY = "saarthi-guest-roadmaps-v1";

function readStore(): Record<string, GuestRoadmap> {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }
    return parsed as Record<string, GuestRoadmap>;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, GuestRoadmap>): boolean {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function listGuestRoadmaps(): GuestRoadmap[] {
  return Object.values(readStore()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

export function getGuestRoadmap(id: string): GuestRoadmap | null {
  return readStore()[id] ?? null;
}

export function saveGuestRoadmap(input: GuestRoadmapInput): GuestRoadmap {
  const store = readStore();
  const timestamp = nowIso();
  const roadmap: GuestRoadmap = {
    id: input.id ?? createId(),
    title: input.title,
    goal: input.goal,
    createdAt: input.createdAt ?? store[input.id ?? ""]?.createdAt ?? timestamp,
    updatedAt: timestamp,
    session: input.session,
    resources: input.resources,
    completedTopics: input.completedTopics,
    quizAttempts: input.quizAttempts,
  };
  store[roadmap.id] = roadmap;
  writeStore(store);
  return roadmap;
}

export function deleteGuestRoadmap(id: string): void {
  const store = readStore();
  delete store[id];
  writeStore(store);
}

export function toRoadmapSnapshot(roadmap: GuestRoadmap): RoadmapSnapshot {
  return {
    title: roadmap.title,
    goal: roadmap.goal,
    session: roadmap.session as RoadmapSnapshot["session"],
    resources: roadmap.resources as unknown as RoadmapSnapshot["resources"],
    progress: {
      completedTopics: roadmap.completedTopics as unknown as JsonValue,
    },
    quiz: roadmap.quizAttempts as unknown as RoadmapSnapshot["quiz"],
  };
}

export function guestRoadmapTitle(goal: string | null): string {
  const cleaned = (goal ?? "").trim();
  if (!cleaned) {
    return "Untitled roadmap";
  }
  return cleaned.length > 80 ? `${cleaned.slice(0, 77)}...` : cleaned;
}
