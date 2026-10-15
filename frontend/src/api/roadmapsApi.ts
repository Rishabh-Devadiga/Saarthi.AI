import { apiClient } from "@/api/apiClient";
import type {
  RoadmapApiResponse,
  RoadmapDeleteApiResponse,
  RoadmapImportPayload,
  RoadmapSnapshot,
  RoadmapsApiResponse,
} from "@/types/roadmaps";

export async function listRoadmaps(): Promise<RoadmapsApiResponse> {
  const response = await apiClient.get<RoadmapsApiResponse>("/roadmaps");
  return response.data;
}

export async function createRoadmap(
  payload: RoadmapSnapshot
): Promise<RoadmapApiResponse> {
  const response = await apiClient.post<RoadmapApiResponse>("/roadmaps", payload);
  return response.data;
}

export async function getRoadmap(id: number): Promise<RoadmapApiResponse> {
  const response = await apiClient.get<RoadmapApiResponse>(`/roadmaps/${id}`);
  return response.data;
}

export async function updateRoadmap(
  id: number,
  payload: Partial<RoadmapSnapshot>
): Promise<RoadmapApiResponse> {
  const response = await apiClient.patch<RoadmapApiResponse>(
    `/roadmaps/${id}`,
    payload
  );
  return response.data;
}

export async function deleteRoadmap(
  id: number
): Promise<RoadmapDeleteApiResponse> {
  const response = await apiClient.delete<RoadmapDeleteApiResponse>(
    `/roadmaps/${id}`
  );
  return response.data;
}

export async function importGuestRoadmap(
  payload: RoadmapImportPayload
): Promise<RoadmapApiResponse> {
  const response = await apiClient.post<RoadmapApiResponse>(
    "/roadmaps/import",
    payload
  );
  return response.data;
}
