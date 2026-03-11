import type {
  ApiResponse,
  CursorPage,
  Thread,
  Message,
  ResearchPlan,
  ResearchMission,
  ResearchRun,
  MissionStatusSummary,
  MissionOutputs,
  TaskRunOutputs,
  ArtifactRef,
  PaginatedResponse,
} from "@/types/api";

export const API_BASE =
  (typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL) || "http://localhost:8000";

const BASE = API_BASE + "/api/v1";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  const json: ApiResponse<T> = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.data as T;
}

export const api = {
  threads: {
    list: (cursor?: string) =>
      apiFetch<CursorPage<Thread>>(
        `/threads${cursor ? "?cursor=" + encodeURIComponent(cursor) : ""}`
      ),
    create: (title: string) =>
      apiFetch<Thread>("/threads", {
        method: "POST",
        body: JSON.stringify({ title }),
      }),
    get: (id: string) => apiFetch<Thread>("/threads/" + id),
    update: (id: string, title: string) =>
      apiFetch<Thread>("/threads/" + id, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      }),
    delete: async (id: string) => {
      const res = await fetch(BASE + "/threads/" + id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${text || res.statusText}`);
      }
    },
    messages: (id: string, cursor?: string) =>
      apiFetch<CursorPage<Message>>(
        `/threads/${id}/messages${cursor ? "?cursor=" + encodeURIComponent(cursor) : ""}`
      ),
  },
  plans: {
    list: (params?: { skip?: number; limit?: number; thread_id?: string; status_filter?: string }) => {
      const qs = new URLSearchParams();
      if (params?.skip != null) qs.set("skip", String(params.skip));
      if (params?.limit != null) qs.set("limit", String(params.limit));
      if (params?.thread_id) qs.set("thread_id", params.thread_id);
      if (params?.status_filter) qs.set("status_filter", params.status_filter);
      const q = qs.toString();
      return apiFetch<PaginatedResponse<ResearchPlan>>(`/plans${q ? "?" + q : ""}`);
    },
    get: (id: string) => apiFetch<ResearchPlan>("/plans/" + id),
    update: (id: string, patch: Partial<ResearchPlan>) =>
      apiFetch<ResearchPlan>("/plans/" + id, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    approve: (id: string, notes?: string) =>
      apiFetch<ResearchPlan>("/plans/" + id + "/approve", {
        method: "POST",
        body: JSON.stringify(notes != null ? { notes } : {}),
      }),
    launch: (id: string) =>
      apiFetch<{ mission_id: string; workflow_id: string; status: string }>(
        "/plans/" + id + "/launch",
        { method: "POST" },
      ),
  },

  missions: {
    list: (params?: { skip?: number; limit?: number; research_plan_id?: string; thread_id?: string; status_filter?: string }) => {
      const qs = new URLSearchParams();
      if (params?.skip != null) qs.set("skip", String(params.skip));
      if (params?.limit != null) qs.set("limit", String(params.limit));
      if (params?.research_plan_id) qs.set("research_plan_id", params.research_plan_id);
      if (params?.thread_id) qs.set("thread_id", params.thread_id);
      if (params?.status_filter) qs.set("status_filter", params.status_filter);
      const q = qs.toString();
      return apiFetch<PaginatedResponse<ResearchMission>>(`/missions${q ? "?" + q : ""}`);
    },
    get: (id: string) => apiFetch<ResearchMission>("/missions/" + id),
    status: (id: string) => apiFetch<MissionStatusSummary>("/missions/" + id + "/status"),
    outputs: (id: string) => apiFetch<MissionOutputs>("/missions/" + id + "/outputs"),
    runs: (id: string) => apiFetch<ResearchRun[]>("/missions/" + id + "/runs"),
    runOutputs: (missionId: string, taskId: string, attemptNumber = 1) =>
      apiFetch<TaskRunOutputs>(`/missions/${missionId}/runs/${taskId}/outputs?attempt_number=${attemptNumber}`),
    artifacts: (missionId: string, taskId: string, attemptNumber = 1) =>
      apiFetch<ArtifactRef[]>(`/missions/${missionId}/runs/${taskId}/artifacts?attempt_number=${attemptNumber}`),
    artifactContent: (missionId: string, taskId: string, artifactName: string, artifactType = "report", attemptNumber = 1) =>
      apiFetch<{ artifact_name: string; artifact_type: string; content: string }>(
        `/missions/${missionId}/runs/${taskId}/artifacts/${encodeURIComponent(artifactName)}/content?attempt_number=${attemptNumber}&artifact_type=${encodeURIComponent(artifactType)}`,
      ),
  },

  runs: {
    list: (params?: { skip?: number; limit?: number; mission_id?: string }) => {
      const qs = new URLSearchParams();
      if (params?.skip != null) qs.set("skip", String(params.skip));
      if (params?.limit != null) qs.set("limit", String(params.limit));
      if (params?.mission_id) qs.set("mission_id", params.mission_id);
      const q = qs.toString();
      return apiFetch<PaginatedResponse<ResearchRun>>(`/runs${q ? "?" + q : ""}`);
    },
    get: (id: string) => apiFetch<ResearchRun>("/runs/" + id),
  },
};
