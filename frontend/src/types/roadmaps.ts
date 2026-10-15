import type { ApiSuccessResponse } from "@/types/api";
import type { JsonValue } from "@/types/learning";

export type RoadmapSource = "server" | "guest";

export type RoadmapSummary = {
  id: number;
  title: string;
  goal: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type RoadmapDetail = RoadmapSummary & {
  session: Record<string, JsonValue> | null;
  resources: Record<string, JsonValue>;
  progress: Record<string, JsonValue>;
  quiz: JsonValue[];
  mentor: Record<string, JsonValue> | null;
  interview: Record<string, JsonValue> | null;
};

export type RoadmapSnapshot = {
  title: string;
  goal?: string | null;
  status?: string;
  session?: Record<string, JsonValue> | null;
  resources?: Record<string, JsonValue>;
  progress?: Record<string, JsonValue>;
  quiz?: JsonValue[];
  mentor?: Record<string, JsonValue> | null;
  interview?: Record<string, JsonValue> | null;
};

export type RoadmapImportPayload = RoadmapSnapshot & {
  guest_id: string;
};

export type RoadmapsApiResponse = ApiSuccessResponse<RoadmapSummary[]>;
export type RoadmapApiResponse = ApiSuccessResponse<RoadmapDetail>;
export type RoadmapDeleteApiResponse = ApiSuccessResponse<Record<string, never>>;
