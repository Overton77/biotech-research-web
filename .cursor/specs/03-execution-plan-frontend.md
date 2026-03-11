# Execution Plan 03 — Research Dashboard, Real-Time Run View & Mission Launch

**Status:** `[active]`  
**Version:** 1.0  
**Scope:** `biotech-research-web` (frontend)

**Backend dependency:** Execution plan `biotech-research-ingestion/.cursor/specs/04-execution-plan.md` (S3 persistence, progress middleware, API endpoints, Socket.IO `research_progress` and `join_mission`).

---

## Overview

This plan specifies frontend work for:

1. **Real-time Research Run dashboard** — A dedicated view that watches a mission by `mission_id`, joins the Socket.IO room, and displays streaming `research_progress` events (tool calls, model responses, agent lifecycle) in a minimal, organized way.
2. **List and detail views** for ResearchPlans, ResearchMissions, and ResearchRuns, with pagination where the backend provides it.
3. **Kicking off a ResearchMission** from the dashboard (launch from an approved plan or from a mission record).
4. **Consuming full outputs from S3** — Viewing mission-level and task-level outputs (reports, artifacts) retrieved via the new backend APIs.

No timelines are specified; only specifications and detailed instructions with examples.

---

## 1. Real-Time Research Run Dashboard

### 1.1 Goal

A single page (or dedicated section) where the user can “watch” an active or completed research mission. The page receives live progress events over Socket.IO and shows them in an organized, minimal way. When the run is finished, the user can open full outputs (from S3) in the same or a linked view.

### 1.2 Route and Entry

- **Route:** `/runs/[missionId]/page.tsx` (or `/missions/[missionId]/run` — align with your routing convention). Use `missionId` as the canonical identifier for the run view, since the backend uses `mission_id` for the Socket.IO room and for S3.
- **Entry points:**
  - From the thread page: after a plan is approved and the mission is launched, show a link or button “Watch run” that navigates to this route with the returned `mission_id`.
  - From a missions list: each mission row has a “View run” / “Watch” action that goes to this page.
  - From the new dashboard home (see Section 3): a card or table row for a mission links to this page.

### 1.3 Socket.IO Contract

- **Namespace:** Existing `/research` namespace (same as coordinator chat).
- **Join room:** On mount, the client emits `join_mission` with `{ "mission_id": missionId }`. The server adds the socket to the room `mission:{missionId}`.
- **Incoming event:** `research_progress`. Payload shape (matches backend spec):

```ts
interface ResearchProgressPayload {
  mission_id: string;
  event_type: string;  // e.g. "tool_start" | "tool_end" | "model_response" | "agent_completed" | "agent_started" | "task_started" | "task_completed" | "task_failed"
  payload: {
    task_id?: string;
    subagent_name?: string;
    agent_role?: "main" | "subagent";
    tool_name?: string;
    args_summary?: string;
    result_summary?: string;
    content_preview?: string;
    message_count?: number;
    summary?: string;
    error?: string;
    // ... other optional fields
  };
  timestamp: string;  // ISO
}
```

- **Leave room:** On unmount, emit `leave_mission` with `{ "mission_id": missionId }` if the server implements it; otherwise the server can drop the socket from the room on disconnect.

### 1.4 Page Layout and Components

- **Layout:** Three logical areas:
  1. **Header** — Mission title, status (pending / running / completed / failed), progress summary (e.g. “Task 2 of 5”, “Subagent: source_finder”), elapsed time. Optional: link to the parent plan or thread.
  2. **Live event stream** — A scrollable list of events (tool_start, tool_end, model_response, agent_completed, etc.). Each row: timestamp, event type, and a short description (e.g. “Tool: search — started”, “Model response (240 chars)”, “Subagent writer completed”). Minimal and scannable.
  3. **Task summary (optional)** — A compact list or grid of task_ids with status (pending / running / completed / failed), updated as events arrive or from a periodic refetch of `GET /missions/{id}/status`.

- **State:**
  - Store the latest mission status (from initial fetch and optionally from progress or refetch).
  - Append each `research_progress` event to a list (cap at a reasonable size, e.g. 500, with “older” truncated or moved to a “Load more”).
  - Optional: derive “current task” and “current subagent” from the last few events for the header.

### 1.5 Components to Add or Extend

- **`app/runs/[missionId]/page.tsx`** (or equivalent path)  
  - Client Component.  
  - Fetches mission by id: `GET /api/v1/missions/{missionId}` (or use existing API base URL from env).  
  - Fetches status: `GET /api/v1/missions/{missionId}/status` for task counts and status.  
  - Uses `useSocket()` (from existing `SocketProvider`) to emit `join_mission` on mount and subscribe to `research_progress`.  
  - Renders header, event stream, and optional task summary.  
  - On unmount, remove the `research_progress` listener and emit `leave_mission` if supported.

- **`components/run/ResearchRunHeader.tsx`**  
  - Props: `mission`, `statusSummary`, `currentTaskId?`, `currentSubagent?`, `elapsedMs?`.  
  - Displays title, status badge, progress text, elapsed time.

- **`components/run/ResearchProgressLog.tsx`**  
  - Props: `events: ResearchProgressPayload[]`, `maxHeight?: string`, `pauseAutoScroll?: boolean`.  
  - Renders a scrollable list; each item shows `timestamp`, `event_type`, and a one-line summary from `payload`.  
  - Optional: “Pause” toggle to stop auto-scrolling so the user can read.  
  - Optional: filter by event_type (e.g. only tool calls, or only model_response).

- **`components/run/TaskStatusStrip.tsx`** (optional)  
  - Props: `taskIds: string[]`, `statusByTaskId: Record<string, "pending" | "running" | "completed" | "failed">`.  
  - Simple horizontal or vertical list of task badges. Status can be derived from `GET /missions/{id}/status` or from progress events.

### 1.6 Example: Subscribing to Progress

```tsx
// In the run page component
useEffect(() => {
  const socket = getSocket(); // or useSocket()
  socket.emit("join_mission", { mission_id: missionId });

  const onProgress = (data: ResearchProgressPayload) => {
    if (data.mission_id !== missionId) return;
    setEvents((prev) => [...prev.slice(-499), data]);
    // Optionally update currentTaskId / currentSubagent from data.payload
  };

  socket.on("research_progress", onProgress);
  return () => {
    socket.off("research_progress", onProgress);
    socket.emit("leave_mission", { mission_id: missionId });
  };
}, [missionId]);
```

### 1.7 Completed Run: Link to Full Outputs

- When mission status is `completed` or `failed`, show a section or button: “View full outputs” (or “Mission outputs”, “Task outputs”).
- Link to a new route or open a drawer/modal that loads:
  - Mission-level: `GET /api/v1/missions/{missionId}/outputs` (mission.json, final report, summary, task-runs index).
  - Task-level: For each task, link to “Task outputs” that calls `GET /api/v1/missions/{missionId}/runs/{taskId}/outputs` and optionally the artifacts list and artifact content (or presigned download URL).

---

## 2. List and Detail Views for Plans, Missions, Runs

### 2.1 Research Plans

- **List:** `GET /api/v1/plans?skip=0&limit=20&status=...&thread_id=...` (per backend 04 spec).  
  - Page: e.g. `/plans` or `/dashboard/plans`.  
  - Table or cards: plan id, title, thread_id, status, created_at, updated_at.  
  - Pagination: Previous/Next or page numbers using `skip` and `limit`; display `total` if the API returns it.

- **Detail:** Existing `GET /api/v1/plans/{planId}`.  
  - Page: `/plans/[planId]` (or keep inline in thread view).  
  - Show full plan (title, objective, stages, tasks, status).  
  - If status is `approved`, show a “Launch mission” button (see Section 4).

### 2.2 Research Missions

- **List:** `GET /api/v1/missions?skip=0&limit=20&research_plan_id=...&thread_id=...&status=...`.  
  - Page: e.g. `/missions` or `/dashboard/missions`.  
  - Table or cards: mission id, title, goal (truncated), research_plan_id, thread_id, status, created_at.  
  - Actions: “View run” → `/runs/[missionId]`, “View plan” → `/plans/[planId]`.

- **Detail:** Existing `GET /api/v1/missions/{missionId}`.  
  - Page: `/missions/[missionId]`.  
  - Show mission metadata, task_defs summary, dependency map, status.  
  - Link to “Watch run” → `/runs/[missionId]` and to “View outputs” when status is completed/failed.

### 2.3 Research Runs

- **List:** `GET /api/v1/runs?skip=0&limit=20&mission_id=...`.  
  - Page: e.g. `/runs` or `/dashboard/runs`.  
  - Table: run id, mission_id, task_id, attempt_number, status, started_at, completed_at.  
  - Click row → run detail or mission run view.

- **Detail:** `GET /api/v1/runs/{runId}` (new in backend 04).  
  - Page: `/runs/detail/[runId]` or a drawer/modal.  
  - Show full ResearchRun document. Link to “Mission” and “Task outputs” (S3) for that mission/task.

### 2.4 Shared Patterns

- **API client:** Add in `lib/api.ts` (or equivalent):
  - `plans.list(params)`, `plans.get(id)`
  - `missions.list(params)`, `missions.get(id)`, `missions.status(id)`, `missions.outputs(id)`
  - `runs.list(params)`, `runs.get(id)`  
  - `missions.runOutputs(missionId, taskId, attemptNumber?)`, `missions.artifacts(missionId, taskId)`, artifact content or presigned URL.
- **Types:** In `types/api.ts`, add TypeScript interfaces for paginated responses (`{ items: T[], total?: number }`), ResearchPlan, ResearchMission, ResearchRun, TaskDef, ArtifactRef, and the S3 output shapes returned by the new endpoints.
- **Loading and error:** Use your existing pattern (e.g. React Query or SWR) for list and detail fetches; show skeletons and error states.

---

## 3. Dashboard Home

### 3.1 Goal

A dedicated dashboard that aggregates plans, missions, and runs and lets the user start a research mission.

- **Route:** `/dashboard` or `/` (if you move the current home to `/threads`).
- **Content:**
  - **Summary cards:** Counts or recent items for plans (e.g. pending approval, approved), missions (running, completed), runs.
  - **Recent plans** — List (or table) of recent plans with status; “View” and “Launch” (if approved).
  - **Recent missions** — List of recent missions with status; “Watch run” and “View outputs”.
  - **Recent runs** — Optional list of recent ResearchRuns across missions.
- **Navigation:** Sidebar or tabs to `/dashboard/plans`, `/dashboard/missions`, `/dashboard/runs` if you split lists into separate pages.

### 3.2 Implementation

- Reuse the same API client and types as in Section 2.
- Fetch `GET /plans`, `GET /missions`, `GET /runs` with small `limit` (e.g. 5–10) for “recent” on the dashboard home.
- Use existing layout and design system (e.g. Shadcn cards, tables, badges).

---

## 4. Kicking Off a ResearchMission

### 4.1 Launch from an Approved Plan

- **Where:** Plan detail page (`/plans/[planId]`) or thread page (when a plan is approved and the panel shows the plan).
- **Action:** “Launch mission” button. Only enabled when `plan.status === "approved"`.
- **Request:** `POST /api/v1/plans/{planId}/launch` (already exists). Response: `{ mission_id, workflow_id, status }`.
- **After launch:** Show a success toast; redirect to `/runs/[missionId]` (or open the run view in a new tab) so the user can watch progress.

### 4.2 Launch from Dashboard

- From the dashboard, “Recent plans” row with status “approved” has a “Launch” button that calls the same `POST /plans/{planId}/launch` and then navigates to the run view.
- Optional: “Launch mission” from the thread page when the coordinator has just received plan approval (current flow already launches automatically; you may add an explicit “Launch again” or “View run” that uses the returned `mission_id` from the existing `mission_launched` Socket.IO event).

### 4.3 Idempotency and Errors

- If the user clicks “Launch” twice, the backend may return 400 or 409 if the mission is already created or the plan is already executing. Show the error in a toast and, if the response includes a `mission_id`, still offer “View run” to go to that mission.

---

## 5. Viewing Full Outputs from S3

### 5.1 Mission-Level Outputs

- **Endpoint:** `GET /api/v1/missions/{missionId}/outputs` (backend 04).
- **Use:** On the run view page, when the mission is completed (or from the mission detail page), a “View full outputs” section fetches this and displays:
  - **Mission JSON** — Collapsible or read-only code block.
  - **Final report (Markdown)** — Rendered with a Markdown component (e.g. `react-markdown`).
  - **Final report (JSON)** — Collapsible or table.
  - **Summary** — Rendered as text or cards.
  - **Task runs index** — List of task runs with links to task-level outputs.

### 5.2 Task-Level Outputs

- **Endpoints:**  
  - `GET /api/v1/missions/{missionId}/runs/{taskId}/outputs?attempt_number=1`  
  - `GET /api/v1/missions/{missionId}/runs/{taskId}/artifacts?attempt_number=1`  
  - Artifact content: `GET /api/v1/missions/{missionId}/runs/{taskId}/artifacts/{artifactName}/content` or a presigned URL.
- **UI:** In the run view or mission detail, a “Task outputs” subsection or a per-task accordion. For each task, show:
  - Run summary (from `run` and `outputs`).
  - Resolved inputs and outputs (collapsible).
  - Events list (optional).
  - Artifacts list with “View” (inline if text/markdown) or “Download” (presigned URL).

### 5.3 Error Handling

- If the backend returns 404 or 503 for S3 outputs (e.g. object not found), show a message: “Outputs not available” or “Run completed before S3 persistence was enabled.”

---

## 6. Implementation Order (Suggested)

1. **Types and API client** — Add types for ResearchPlan, ResearchMission, ResearchRun, pagination, and S3 output responses. Add `plans.list`, `missions.list`, `missions.get`, `missions.status`, `missions.outputs`, `runs.list`, `runs.get`, and task output/artifact endpoints.
2. **Socket: join_mission and research_progress** — Implement `join_mission` emit and `research_progress` listener; ensure backend has the handler and room (per backend 04).
3. **Run dashboard page** — Build `/runs/[missionId]` with header, progress log, and optional task strip; wire Socket and optional status refetch.
4. **List and detail pages** — Add `/plans`, `/missions`, `/runs` list pages and detail pages (or reuse existing plan in thread); wire pagination and links.
5. **Dashboard home** — Add dashboard route with recent plans/missions/runs and links.
6. **Launch mission** — Add “Launch mission” on approved plan (plan detail and dashboard); redirect to run view after success.
7. **Full outputs** — Add “View full outputs” section and task-level outputs/artifacts using the new S3-backed endpoints.

---

## 7. References

- Backend spec: `biotech-research-ingestion/.cursor/specs/04-execution-plan.md`
- Existing frontend patterns: `src/providers/SocketProvider.tsx`, `src/lib/socket.ts`, `src/app/threads/[id]/page.tsx`, `src/components/chat/ChatView.tsx`, `src/components/plan/PlanReviewPanel.tsx`
