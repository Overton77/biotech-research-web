# Technical Specification — Frontend (biotech-research-web)

**Status:** `[active]`  
**Version:** 1.0  
**Backend contract:** `biotech-research-ingestion` REST API + Socket.IO `/research` namespace

---

## 1. Application Overview

`biotech-research-web` is the operator interface for the Deep Biotech Research Agent system. It allows internal operators to:

1. Start and manage research conversation threads
2. Chat with the Coordinator / Planner agent in real time (streaming)
3. Review, edit, approve, or reject AI-generated research plans
4. Launch research runs from approved plans
5. Monitor live execution progress (task-level granularity)
6. Browse and download completed research artifacts

---

## 2. Route Structure

| Route | Component Type | Description |
|---|---|---|
| `/` | Server Component | Dashboard — thread list, recent runs |
| `/threads/new` | Client Component | New thread modal or page |
| `/threads/[id]` | Mixed (Server shell + Client body) | Chat view + plan review panel |
| `/runs/[id]` | Client Component | Live run monitor |
| `/artifacts/[id]` | Server Component | Artifact viewer |

### Route Details

#### `/` — Dashboard
- Server-rendered thread list from `GET /api/v1/threads`
- Each thread card shows: title, last message preview, status badge, date
- "New Research" CTA button
- Recent runs section (latest 5 runs across threads)

#### `/threads/[id]` — Thread View
- Server Component fetches initial message history: `GET /api/v1/threads/{id}/messages`
- Client Component takes over for real-time Socket.IO subscriptions
- Layout: two-column on large screens — left: chat; right: plan review panel (slides in on `plan_ready` event)
- Plan panel is hidden until a plan is ready or an existing approved plan is loaded

#### `/runs/[id]` — Run Monitor
- Fully client-side (no SSR useful here — content is entirely real-time)
- Three zones: header (run summary), main (task grid), right panel (event log + artifact panel)
- Subscribes to room `run:{run_id}` on mount

#### `/artifacts/[id]` — Artifact Viewer
- Server-rendered metadata from `GET /api/v1/artifacts/{id}`
- For markdown/text artifacts: rendered inline
- For binary/large artifacts: presigned download link from `GET /api/v1/artifacts/{id}/download`

---

## 3. Socket.IO Integration

### Connection Setup

```typescript
// lib/socket.ts
import { io, Socket } from "socket.io-client"

let _socket: Socket | null = null

export function getSocket(): Socket {
  if (!_socket) {
    _socket = io(process.env.NEXT_PUBLIC_API_URL + "/research", {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    })
  }
  return _socket
}

export function disconnectSocket(): void {
  _socket?.disconnect()
  _socket = null
}
```

### SocketProvider

```typescript
// providers/SocketProvider.tsx
"use client"

import { createContext, useContext, useEffect, useRef } from "react"
import { Socket } from "socket.io-client"
import { getSocket } from "@/lib/socket"

const SocketContext = createContext<Socket | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket>(getSocket())

  useEffect(() => {
    const socket = socketRef.current
    socket.connect()
    return () => { socket.disconnect() }
  }, [])

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket(): Socket {
  const socket = useContext(SocketContext)
  if (!socket) throw new Error("useSocket must be used within SocketProvider")
  return socket
}
```

### Room Subscription Pattern

```typescript
// In a Client Component:
const socket = useSocket()

useEffect(() => {
  socket.emit("join_thread", { thread_id: threadId })

  return () => {
    // No explicit leave needed — server handles disconnect cleanup
  }
}, [socket, threadId])
```

---

## 4. Complete Socket.IO Event Reference

### Server → Client Events

| Event | Payload Type | Handler location |
|---|---|---|
| `coordinator_token` | `{ token: string, run_id: string, thread_id: string }` | `useMessageStore` — accumulate token |
| `coordinator_tool_start` | `{ tool_name: string, args_summary: string, run_id: string, thread_id: string }` | `useMessageStore` — show tool indicator |
| `coordinator_tool_end` | `{ tool_name: string, result_summary: string, run_id: string, thread_id: string }` | `useMessageStore` — clear tool indicator |
| `plan_ready` | `{ plan: ResearchPlan, thread_id: string, interrupt_id: string }` | `usePlanStore` — open review panel |
| `plan_revision_needed` | `{ plan: ResearchPlan, notes: string, thread_id: string }` | `usePlanStore` — update plan, show notes |
| `run_started` | `{ run_id: string, plan_id: string, thread_id: string, task_count: number }` | `useRunStore` — initialize run state |
| `task_started` | `{ run_id: string, task_id: string, task_title: string, stage: string }` | `useRunStore` — mark task running |
| `task_token` | `{ run_id: string, task_id: string, token: string }` | `useRunStore` — accumulate task token |
| `task_tool_start` | `{ run_id: string, task_id: string, tool_name: string, args_summary: string }` | `useRunStore` — add event to log |
| `task_tool_end` | `{ run_id: string, task_id: string, tool_name: string, result_summary: string }` | `useRunStore` — add event to log |
| `task_complete` | `{ run_id: string, task_id: string, outputs_summary: string }` | `useRunStore` — mark task complete |
| `task_failed` | `{ run_id: string, task_id: string, error: string, retry_count: number }` | `useRunStore` — mark task failed |
| `run_complete` | `{ run_id: string, artifacts: ArtifactRef[], duration_seconds: number }` | `useRunStore` — mark run complete, show artifacts |
| `run_failed` | `{ run_id: string, failed_task_id: string, error: string }` | `useRunStore` — mark run failed |
| `error` | `{ message: string, code: string }` | Global error toast |

### Client → Server Events

| Event | Payload Type | Sent from |
|---|---|---|
| `join_thread` | `{ thread_id: string }` | Thread page mount |
| `join_run` | `{ run_id: string }` | Run monitor mount |
| `send_message` | `{ thread_id: string, content: string }` | Chat input submit |
| `plan_approved` | `{ thread_id: string, interrupt_id: string, plan: ResearchPlan }` | Plan review approve button |
| `plan_rejected` | `{ thread_id: string, interrupt_id: string, notes: string }` | Plan review reject button |
| `approve_tool` | `{ thread_id: string, interrupt_id: string, decisions: Decision[] }` | Tool approval UI (future) |

---

## 5. TypeScript Types

All backend types mirrored in `src/types/api.ts`:

```typescript
// types/api.ts

export interface Thread {
  id: string
  title: string
  created_at: string
  updated_at: string
  status: "active" | "archived"
  metadata: Record<string, unknown>
}

export interface Message {
  id: string
  thread_id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string | ContentPart[]
  created_at: string
  run_id?: string
  metadata: Record<string, unknown>
}

export interface AgentConfig {
  model: string
  system_prompt: string
  tools: string[]
  backend_type: "state" | "filesystem" | "composite"
  backend_root_dir?: string
  interrupt_on?: Record<string, unknown>
  max_retries: number
  timeout: number
}

export interface TaskInputRef {
  name: string
  source: "task_output" | "user_provided" | "external"
  source_task_id?: string
  output_name?: string
  description: string
}

export interface TaskOutputSpec {
  name: string
  type: "text" | "markdown" | "json" | "file" | "s3_ref"
  description: string
  required: boolean
}

export interface ResearchTask {
  id: string
  title: string
  description: string
  stage: string
  sub_stage?: string
  agent_config: AgentConfig
  inputs: TaskInputRef[]
  outputs: TaskOutputSpec[]
  dependencies: string[]
  estimated_duration_minutes?: number
}

export interface ResearchPlan {
  id: string
  thread_id: string
  title: string
  objective: string
  stages: string[]
  tasks: ResearchTask[]
  status: "draft" | "pending_approval" | "approved" | "rejected" | "executing" | "complete" | "failed"
  created_at: string
  updated_at: string
  approved_at?: string
  approver_notes?: string
  version: number
}

export type TaskRunStatus = "pending" | "ready" | "running" | "complete" | "failed" | "skipped"

export interface TaskRun {
  task_id: string
  status: TaskRunStatus
  started_at?: string
  completed_at?: string
  outputs: Record<string, unknown>
  error?: string
  retry_count: number
}

export interface ResearchRun {
  id: string
  plan_id: string
  thread_id: string
  status: "pending" | "running" | "paused" | "complete" | "failed" | "cancelled"
  started_at?: string
  completed_at?: string
  task_runs: TaskRun[]
}

export interface Artifact {
  id: string
  run_id: string
  task_id: string
  name: string
  type: "report" | "document" | "dataset" | "log" | "intermediate"
  storage: "s3" | "mongodb"
  s3_key?: string
  content_type: string
  created_at: string
  metadata: Record<string, unknown>
}

export interface ArtifactRef {
  id: string
  name: string
  type: Artifact["type"]
}

// API response envelope
export interface ApiResponse<T> {
  data: T | null
  error: { code: string; message: string } | null
}

// Socket.IO decision types (for tool approval)
export type Decision =
  | { type: "approve" }
  | { type: "reject" }
  | { type: "edit"; edited_action: { name: string; args: Record<string, unknown> } }
```

---

## 6. Zustand Stores

### messageStore

```typescript
// stores/messageStore.ts
interface MessageStore {
  messages: Message[]
  streamingContent: string      // accumulates coordinator_token events
  isStreaming: boolean
  activeToolName: string | null // set on tool_start, cleared on tool_end
  appendToken: (token: string) => void
  finalizeStream: () => void    // called when stream ends — commits to messages
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setActiveTool: (toolName: string | null) => void
}
```

### planStore

```typescript
// stores/planStore.ts
interface PlanStore {
  currentPlan: ResearchPlan | null
  interruptId: string | null
  isPanelOpen: boolean
  isEditing: boolean
  setPlan: (plan: ResearchPlan, interruptId: string) => void
  openPanel: () => void
  closePanel: () => void
  startEditing: () => void
  stopEditing: () => void
  clearPlan: () => void
}
```

### runStore

```typescript
// stores/runStore.ts
interface RunEvent {
  id: string
  timestamp: string
  type: string
  task_id?: string
  message: string
  data?: Record<string, unknown>
}

interface RunStore {
  run: ResearchRun | null
  taskStatuses: Record<string, TaskRunStatus>
  taskTokens: Record<string, string>   // task_id → accumulated token
  events: RunEvent[]
  artifacts: ArtifactRef[]
  setRun: (run: ResearchRun) => void
  updateTaskStatus: (taskId: string, status: TaskRunStatus) => void
  appendTaskToken: (taskId: string, token: string) => void
  addEvent: (event: RunEvent) => void
  setArtifacts: (artifacts: ArtifactRef[]) => void
}
```

---

## 7. Plan Review Component Contract

### PlanReviewPanel

Renders the full `ResearchPlan` for human review. Supports:
- View-only mode (default)
- Edit mode — inline editing of task titles, descriptions, dependencies
- Action bar: Approve / Request Revision / Reject

```typescript
interface PlanReviewPanelProps {
  plan: ResearchPlan
  interruptId: string
  threadId: string
  onApprove: (plan: ResearchPlan) => void    // emits plan_approved
  onReject: (notes: string) => void           // emits plan_rejected
  onClose: () => void
}
```

### Plan Stage Hierarchy Display

```
Stage: "Literature Review"
├── Task: "Search PubMed for CRISPR cas9 delivery methods"
│   ├── Dependencies: none
│   ├── Inputs: [user_objective]
│   └── Outputs: [literature_summary.md]
└── Task: "Parse and chunk top 10 papers"
    ├── Dependencies: [search-pubmed-task-id]
    ├── Inputs: [literature_summary.md]
    └── Outputs: [paper_chunks.json]

Stage: "Data Analysis"
└── Task: "Analyze efficacy patterns across papers"
    ├── Dependencies: [parse-papers-task-id]
    ├── Inputs: [paper_chunks.json]
    └── Outputs: [analysis_report.md]
```

---

## 8. Run Monitor Component Contract

### TaskCard Status Colors

| Status | Color |
|---|---|
| `pending` | Gray |
| `ready` | Blue (pulse animation) |
| `running` | Amber (spinner) |
| `complete` | Green |
| `failed` | Red |
| `skipped` | Gray/muted |

### EventLog

- Scrolling list, newest at bottom
- Each entry: timestamp, task badge, event type icon, message
- Auto-scrolls to bottom on new events
- "Pause scroll" toggle for reading history

### Token Stream in TaskCard

- Shows live LLM token output inside the task card while `status === "running"`
- Fades out after task completes, replaced by `outputs_summary`

---

## 9. API Client

```typescript
// lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_URL + "/api/v1"

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  })
  const json: ApiResponse<T> = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.data!
}

export const api = {
  threads: {
    list: () => apiFetch<Thread[]>("/threads"),
    create: (title: string) => apiFetch<Thread>("/threads", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
    get: (id: string) => apiFetch<Thread>("/threads/" + id),
    messages: (id: string, cursor?: string) =>
      apiFetch<Message[]>(`/threads/${id}/messages${cursor ? "?cursor=" + cursor : ""}`),
  },
  plans: {
    get: (id: string) => apiFetch<ResearchPlan>("/plans/" + id),
    update: (id: string, patch: Partial<ResearchPlan>) =>
      apiFetch<ResearchPlan>("/plans/" + id, { method: "PATCH", body: JSON.stringify(patch) }),
    approve: (id: string) =>
      apiFetch<ResearchPlan>("/plans/" + id + "/approve", { method: "POST" }),
  },
  runs: {
    create: (plan_id: string) =>
      apiFetch<ResearchRun>("/runs", { method: "POST", body: JSON.stringify({ plan_id }) }),
    get: (id: string) => apiFetch<ResearchRun>("/runs/" + id),
    artifacts: (id: string) => apiFetch<Artifact[]>("/runs/" + id + "/artifacts"),
  },
  artifacts: {
    get: (id: string) => apiFetch<Artifact>("/artifacts/" + id),
    downloadUrl: (id: string) =>
      apiFetch<{ url: string }>("/artifacts/" + id + "/download"),
  },
}
```
