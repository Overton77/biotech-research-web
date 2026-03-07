import type { ApiResponse, CursorPage, Thread, Message, ResearchPlan } from "@/types/api";

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
    messages: (id: string, cursor?: string) =>
      apiFetch<CursorPage<Message>>(
        `/threads/${id}/messages${cursor ? "?cursor=" + encodeURIComponent(cursor) : ""}`
      ),
  },
  plans: {
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
  },
};
