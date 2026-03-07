# Execution Plan — Frontend (biotech-research-web)

**Status:** `[active]`  
**Version:** 1.0  
**Mirrors backend phases in:** `biotech-research-ingestion/.cursor/specs/03-execution-plan.md`

---

## Overview

The frontend runs in parallel with the backend at every phase. At each phase boundary it exposes exactly what the backend can do — no more, no less. The frontend does not need to be feature-complete before moving to the next backend phase.

---

## Phase 0 — Foundation Setup
**Goal:** App starts, Socket.IO connects, layout shell renders.  
**Backend counterpart:** Phase 0  
**Duration:** Days 1–2 (parallel with backend)

| # | Task | Effort |
|---|---|---|
| 0.1 | `pnpm add socket.io-client zustand` | S |
| 0.2 | `pnpm dlx shadcn@latest init` — initialize Shadcn UI | S |
| 0.3 | `pnpm add -D @types/node` (if not present) | S |
| 0.4 | `lib/socket.ts` — Socket.IO singleton, `/research` namespace, env URL | S |
| 0.5 | `providers/SocketProvider.tsx` — connect on mount, expose via context | S |
| 0.6 | Wire `SocketProvider` into `app/layout.tsx` | S |
| 0.7 | Create `lib/api.ts` — typed `apiFetch` wrapper with error envelope | S |
| 0.8 | Create `types/api.ts` — stub TypeScript types (Thread, Message) | S |
| 0.9 | Basic sidebar layout: nav, content area, header | M |
| 0.10 | `app/page.tsx` — placeholder thread list with loading state | S |
| 0.11 | Verify: `pnpm dev` starts, `/` renders, Socket.IO connects to backend | S |

**Milestone:** App renders without errors. Socket.IO connection established (visible in browser DevTools network tab).

**Acceptance criteria:**
- `pnpm dev` starts without TypeScript errors
- Root layout renders with sidebar
- Socket.IO client shows connected status

---

## Phase 1 — Thread & Message API
**Goal:** Users can create and navigate threads.  
**Backend counterpart:** Phase 1  
**Duration:** Days 3–4

| # | Task | Effort |
|---|---|---|
| 1.1 | Add `Thread` and `Message` types to `types/api.ts` | S |
| 1.2 | `api.threads.list()`, `api.threads.create()`, `api.threads.get()`, `api.threads.messages()` in `lib/api.ts` | S |
| 1.3 | `app/page.tsx` — Server Component fetches thread list, renders `ThreadList` | M |
| 1.4 | `components/threads/ThreadList.tsx` — thread cards with title, date, status | M |
| 1.5 | `components/threads/ThreadCard.tsx` — single card with link to `/threads/[id]` | S |
| 1.6 | New thread button → `POST /threads` → redirect to `/threads/[id]` | M |
| 1.7 | `app/threads/[id]/page.tsx` — Server Component fetches initial messages, renders shell | M |
| 1.8 | `app/threads/[id]/loading.tsx` — skeleton loader | S |

**Milestone:** Users can create a thread and navigate to it. Thread list shows all threads.

---

## Phase 2 — Coordinator Chat + Streaming
**Goal:** Users can chat with the Coordinator and see streaming token output.  
**Backend counterpart:** Phase 2  
**Duration:** Days 5–9

| # | Task | Effort |
|---|---|---|
| 2.1 | `stores/messageStore.ts` — messages array, streamingContent buffer, isStreaming flag | M |
| 2.2 | `components/chat/ChatView.tsx` — message list + input box, uses `messageStore` | M |
| 2.3 | `components/chat/MessageBubble.tsx` — user/assistant message, role styling | M |
| 2.4 | `components/chat/StreamingMessage.tsx` — renders `streamingContent` with cursor indicator | M |
| 2.5 | `components/chat/ToolActivity.tsx` — shows active tool name when `coordinator_tool_start` fires | S |
| 2.6 | Socket.IO subscription in thread page — `join_thread`, handle `coordinator_token`, `coordinator_tool_start/end` | M |
| 2.7 | Send message: emit `send_message` → set `isStreaming = true` → accumulate tokens → `finalizeStream()` on last token | M |
| 2.8 | Load initial message history from server on page mount | S |
| 2.9 | Empty state: "Start a new research conversation" | S |

**Milestone:** Full streaming conversation with the Coordinator. Token output streams in real time. Tool activity shows during web search.

**Notes:**
- Token accumulation must handle rapid fire events without stutter — use `requestAnimationFrame` batching or React batched state updates
- `finalizeStream()` is called when the socket stream ends — this converts `streamingContent` to a proper `Message` record and clears the buffer
- Auto-scroll chat to bottom on new message/token

---

## Phase 3 — Plan Review Panel
**Goal:** Full plan review workflow — receive, view, edit, approve/reject.  
**Backend counterpart:** Phase 3  
**Duration:** Days 10–15

| # | Task | Effort |
|---|---|---|
| 3.1 | Add all plan types to `types/api.ts` — `ResearchPlan`, `ResearchTask`, `AgentConfig`, etc. | S |
| 3.2 | `stores/planStore.ts` — currentPlan, interruptId, isPanelOpen, isEditing state | M |
| 3.3 | Socket.IO: handle `plan_ready` → set plan in store → open panel | S |
| 3.4 | Socket.IO: handle `plan_revision_needed` → update plan, show notes toast | S |
| 3.5 | `components/plan/PlanReviewPanel.tsx` — slide-in panel (Sheet from Shadcn) with plan content | L |
| 3.6 | `components/plan/PlanStage.tsx` — stage section with task list | M |
| 3.7 | `components/plan/PlanTask.tsx` — task card: title, description, dependencies, inputs/outputs | M |
| 3.8 | `components/plan/PlanActions.tsx` — Approve / Request Revision / Reject buttons + notes field | M |
| 3.9 | Approve: emit `plan_approved` with edited plan (if any edits) → close panel → show toast | M |
| 3.10 | Reject: emit `plan_rejected` with notes → close panel → show toast | M |
| 3.11 | Thread page layout: two-column on lg+ screens, panel slides in from right | M |
| 3.12 | Plan status badge in thread header (draft / pending / approved / rejected) | S |
| 3.13 | `pnpm dlx shadcn@latest add sheet badge toast` | S |

**Milestone:** User receives a plan in the UI, reviews it, approves it. Backend receives approval and resumes execution.

**Component behavior notes:**
- Panel opens automatically when `plan_ready` fires
- Plan is read-only by default; "Edit Plan" button enables inline editing
- In edit mode, task titles and descriptions are editable text areas
- Approve sends the (possibly edited) plan back in `plan_approved` payload
- On approval, panel closes and a success toast shows

---

## Phase 4 — Execution Compiler (Frontend: No Work)
**Backend only phase.** Frontend has nothing to build here.  
**Use this time to:** polish phases 1–3, address any UX issues found during testing.

---

## Phase 5 — Run Monitor
**Goal:** Live execution progress with task-level status and event log.  
**Backend counterpart:** Phase 5  
**Duration:** Days 19–28 (frontend portion ~5 days)

| # | Task | Effort |
|---|---|---|
| 5.1 | Add run types to `types/api.ts` — `ResearchRun`, `TaskRun`, `TaskRunStatus` | S |
| 5.2 | `stores/runStore.ts` — run, taskStatuses, taskTokens, events, artifacts | M |
| 5.3 | `api.runs.create()`, `api.runs.get()`, `api.runs.artifacts()` in `lib/api.ts` | S |
| 5.4 | "Launch Run" button in thread view — appears when plan is `approved` | S |
| 5.5 | On launch: `POST /runs` → redirect to `/runs/[id]` | S |
| 5.6 | `app/runs/[id]/page.tsx` — Client Component with run monitor layout | M |
| 5.7 | `components/run/RunMonitor.tsx` — three-zone layout: header, task grid, event log | M |
| 5.8 | `components/run/TaskGrid.tsx` — responsive grid of task cards | M |
| 5.9 | `components/run/TaskCard.tsx` — status badge, stage label, live token stream, outputs summary | L |
| 5.10 | `components/run/EventLog.tsx` — scrolling event list, auto-scroll, pause toggle | M |
| 5.11 | Socket.IO in run page: `join_run`, handle all task/run events → update store | M |
| 5.12 | Run status header: overall status, task count (N/total complete), elapsed time | M |
| 5.13 | `pnpm dlx shadcn@latest add progress` | S |
| 5.14 | Task dependency visualization: simple ordered list grouped by stage | M |

**Milestone:** Run monitor shows live task progress. Event log streams in real time. Users see task tokens as workers execute.

**Notes:**
- Task cards render in topological order (depth 0 first, then depth 1, etc.) to visually show dependencies
- Tasks at the same depth can show as a row (they run in parallel)
- Running task shows a pulsing amber ring around the card
- Complete task shows green check and `outputs_summary`
- Failed task shows red with error message and retry count

---

## Phase 6 — Artifacts
**Goal:** Completed runs have viewable and downloadable artifacts.  
**Backend counterpart:** Phase 6  
**Duration:** Days 29–32 (frontend portion ~2 days)

| # | Task | Effort |
|---|---|---|
| 6.1 | Add `Artifact`, `ArtifactRef` to `types/api.ts` | S |
| 6.2 | `components/run/ArtifactPanel.tsx` — artifact list, type badges, download/view links | M |
| 6.3 | Show artifact panel in run monitor after `run_complete` fires | S |
| 6.4 | `app/artifacts/[id]/page.tsx` — Server Component: fetch artifact, render markdown/text inline | M |
| 6.5 | Download button: fetch presigned URL → trigger browser download | S |

**Milestone:** Completed run shows artifact list. Markdown reports render inline. Downloads work.

---

## Phase 7 — Observability (Frontend: Minor)
**Goal:** Connection status, error states, reconnect UX.  
**Backend counterpart:** Phase 7  
**Duration:** Days 33–35 (frontend: 1 day)

| # | Task | Effort |
|---|---|---|
| 7.1 | Socket connection status indicator (connected / reconnecting / disconnected) in layout | S |
| 7.2 | Handle `error` Socket.IO event → toast with message | S |
| 7.3 | Offline state handling — graceful degradation when backend unreachable | S |

---

## Phase 8 — Polish and Iteration
**Goal:** UX refinement based on real usage.  
**Duration:** Ongoing after Phase 7

| # | Task | Effort |
|---|---|---|
| 8.1 | Mobile-responsive layouts for thread view and run monitor | M |
| 8.2 | Keyboard shortcuts: Cmd+Enter to send, Escape to close panel | S |
| 8.3 | Plan diff view: show what changed between plan versions | M |
| 8.4 | Run history: list past runs for a thread | M |
| 8.5 | Dark mode (Tailwind v4 + Shadcn) | M |

---

## Shadcn Components Needed (by phase)

| Phase | Components |
|---|---|
| 0 | `button`, `separator` |
| 1 | `card`, `badge`, `skeleton` |
| 2 | `scroll-area`, `textarea`, `avatar` |
| 3 | `sheet`, `badge`, `toast`, `dialog` |
| 5 | `progress`, `tabs` |
| 6 | (no new components) |

Install all at once or per phase:
```bash
pnpm dlx shadcn@latest add button separator card badge skeleton scroll-area textarea avatar sheet toast dialog progress tabs
```

---

## Key Implementation Notes

### Streaming Token Accumulation

```typescript
// In ChatView socket effect:
socket.on("coordinator_token", ({ token }) => {
  useMessageStore.getState().appendToken(token)
})

// In messageStore:
appendToken: (token) => set((s) => ({
  streamingContent: s.streamingContent + token,
  isStreaming: true,
}))

// When stream ends (detect via coordinator_tool_end or message boundary):
finalizeStream: () => set((s) => {
  const newMessage: Message = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: s.streamingContent,
    created_at: new Date().toISOString(),
    thread_id: currentThreadId,
    metadata: {},
  }
  return {
    messages: [...s.messages, newMessage],
    streamingContent: "",
    isStreaming: false,
  }
})
```

### Plan Approval Flow

```typescript
// In PlanActions.tsx:
function handleApprove() {
  const { currentPlan, interruptId } = usePlanStore.getState()
  socket.emit("plan_approved", {
    thread_id: threadId,
    interrupt_id: interruptId,
    plan: currentPlan,   // send back with any edits applied
  })
  usePlanStore.getState().closePanel()
  toast({ title: "Plan approved", description: "Research execution will begin shortly." })
}
```

### Run Event Log Entry

```typescript
function buildEventEntry(event: string, payload: Record<string, unknown>): RunEvent {
  const icons: Record<string, string> = {
    task_started: "▶",
    task_complete: "✓",
    task_failed: "✗",
    task_tool_start: "⚡",
    task_tool_end: "·",
    run_complete: "🏁",
    run_failed: "⛔",
  }
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type: event,
    task_id: payload.task_id as string | undefined,
    message: buildEventMessage(event, payload),
    data: payload,
  }
}
```

---

## Effort Legend

| Size | Meaning |
|---|---|
| S | Small — 1–3 hours |
| M | Medium — half day to 1 day |
| L | Large — 1–2 days |
