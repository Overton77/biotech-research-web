# biotech-research-web — Agent Instructions

**Role:** Deep Biotech Research Agent — Frontend  
**Status:** `[active]` — Phase 0 (Foundation Setup)  
**Spec source of truth:** `.cursor/specs/`  
**Backend:** `biotech-research-ingestion` (REST + Socket.IO)

---

## What This Repo Is

This is the frontend for the Deep Biotech Research Agent system. It provides the operator interface for:

- **Thread management** — creating and navigating research conversations
- **Coordinator chat** — streaming conversation with the AI Coordinator / Planner agent
- **Plan review** — structured UI for reviewing, editing, approving, or rejecting research plans
- **Research run monitoring** — live progress display with task-level status and event streaming
- **Artifact browser** — viewing and downloading completed research outputs

This repo does **not** own any agent logic, business logic, or data persistence. It is a pure frontend consumer of the `biotech-research-ingestion` backend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict) |
| Framework | Next.js 16 (App Router) |
| Package manager | pnpm |
| Styling | Tailwind CSS v4 |
| UI components | Shadcn UI |
| Real-time | `socket.io-client` (Socket.IO) |
| State management | `zustand` (client-side stores) |
| Data fetching | `fetch` with React Server Components for initial loads; SWR or React Query for client polling |
| Forms | `react-hook-form` + `zod` |

---

## Architecture

### Rendering Model

| Route | Rendering | Why |
|---|---|---|
| `/` (thread list) | Server Component + `fetch` | Static list, no real-time |
| `/threads/[id]` | Server Component (initial) + Client Component (socket) | Initial history from server; live updates via Socket.IO |
| `/runs/[id]` | Client Component | Fully real-time, Socket.IO driven |
| `/artifacts/[id]` | Server Component | Static content |

### Socket.IO Integration

Single Socket.IO instance per browser session, managed in `lib/socket.ts`. Connects to the backend `/research` namespace.

```typescript
// lib/socket.ts
import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL + "/research", {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
    })
  }
  return socket
}
```

Clients join rooms immediately on page load:
- Thread page: `join_thread` event → room `thread:{thread_id}`
- Run page: `join_run` event → room `run:{run_id}`

### State Management

Global zustand stores:
- `useThreadStore` — thread list, active thread
- `useMessageStore` — messages for active thread, streaming token buffer
- `usePlanStore` — current plan, plan review state (open/closed, pending edits)
- `useRunStore` — run status, task statuses, event log

---

## Page and Component Structure

```
biotech-research-web/src/
├── app/
│   ├── layout.tsx                  # Root layout — SocketProvider, fonts, global styles
│   ├── page.tsx                    # / — Thread list dashboard
│   ├── threads/
│   │   ├── new/
│   │   │   └── page.tsx            # New thread creation
│   │   └── [id]/
│   │       ├── page.tsx            # Thread view — chat + plan panel
│   │       └── loading.tsx
│   ├── runs/
│   │   └── [id]/
│   │       ├── page.tsx            # Run monitor
│   │       └── loading.tsx
│   └── artifacts/
│       └── [id]/
│           └── page.tsx            # Artifact viewer
├── components/
│   ├── chat/
│   │   ├── ChatView.tsx            # Message list + input
│   │   ├── MessageBubble.tsx       # Single message (user/assistant)
│   │   ├── StreamingMessage.tsx    # Token-by-token accumulation
│   │   └── ToolActivity.tsx        # Tool call indicator
│   ├── plan/
│   │   ├── PlanReviewPanel.tsx     # Full plan review UI
│   │   ├── PlanStage.tsx           # Stage header + task list
│   │   ├── PlanTask.tsx            # Single task card
│   │   ├── PlanActions.tsx         # Approve / Request Revision / Reject buttons
│   │   └── PlanEditor.tsx          # Editable plan fields
│   ├── run/
│   │   ├── RunMonitor.tsx          # Run page root component
│   │   ├── TaskGrid.tsx            # Task status grid
│   │   ├── TaskCard.tsx            # Single task with status
│   │   ├── EventLog.tsx            # Scrolling event stream
│   │   └── ArtifactPanel.tsx       # Artifacts list
│   ├── threads/
│   │   ├── ThreadList.tsx
│   │   └── ThreadCard.tsx
│   └── ui/                         # Shadcn UI components
├── lib/
│   ├── socket.ts                   # Socket.IO singleton
│   ├── api.ts                      # REST API client (typed fetch wrappers)
│   └── utils.ts
├── stores/
│   ├── threadStore.ts
│   ├── messageStore.ts
│   ├── planStore.ts
│   └── runStore.ts
├── types/
│   └── api.ts                      # TypeScript types for all API shapes
└── providers/
    └── SocketProvider.tsx          # React context — socket connection lifecycle
```

---

## Key Conventions

### TypeScript
- Strict mode — `"strict": true` in `tsconfig.json`.
- All API response shapes have TypeScript types in `types/api.ts` matching the backend Pydantic models.
- No `any`. Use `unknown` with type guards when type is genuinely unknown.

### Next.js App Router
- Server Components for initial data fetches (thread list, artifact content).
- Client Components (`"use client"`) for anything that uses Socket.IO, zustand, or event handlers.
- Never put Socket.IO logic in Server Components.
- Use `loading.tsx` for Suspense boundaries on all data-fetching pages.

### Socket.IO
- All socket event subscriptions happen in `useEffect` with cleanup.
- Never subscribe to socket events at module scope.
- Use room-based targeting — always `join_thread` or `join_run` before expecting events.

### Styling
- Tailwind CSS v4 utility classes only.
- Component variants via `cva` (class-variance-authority) for Shadcn components.
- No inline `style` props.

### API Client
- All REST calls go through `lib/api.ts` typed wrappers — no raw `fetch` in components.
- API base URL from `process.env.NEXT_PUBLIC_API_URL`.
- Socket.IO URL from `process.env.NEXT_PUBLIC_API_URL`.

### Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Backend Contract

This frontend connects to `biotech-research-ingestion` via:

### REST API (base: `NEXT_PUBLIC_API_URL/api/v1`)

| Endpoint | Used by |
|---|---|
| `GET /threads` | Thread list page |
| `POST /threads` | New thread creation |
| `GET /threads/{id}` | Thread page initial load |
| `GET /threads/{id}/messages` | Message history |
| `GET /plans/{id}` | Plan review panel |
| `PATCH /plans/{id}` | Plan edits |
| `POST /runs` | Launch run from approved plan |
| `GET /runs/{id}` | Run status |
| `GET /runs/{id}/artifacts` | Artifact list |
| `GET /artifacts/{id}/download` | Presigned S3 URL |
| `GET /health` | Connection check |

### Socket.IO (`NEXT_PUBLIC_API_URL/research` namespace)

See `.cursor/specs/01-technical-specification-frontend.md` for the complete event table.

---

## Build Commands

```bash
# Install deps
pnpm install

# Development server
pnpm dev

# Build for production
pnpm build

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Add a dependency
pnpm add <package>

# Add a dev dependency
pnpm add -D <package>

# Add a Shadcn component
pnpm dlx shadcn@latest add <component>
```

---

## Spec Files in This Directory

| File | Contents |
|---|---|
| `specs/01-technical-specification-frontend.md` | Frontend architecture, event model, component contracts |
| `specs/02-execution-plan-frontend.md` | Frontend phase-by-phase implementation plan |

---

## Current Phase

**Phase 0 — Foundation Setup**

Next tasks:
1. Install Shadcn UI, `socket.io-client`, `zustand`
2. Create `lib/socket.ts` and `providers/SocketProvider.tsx`
3. Wire `SocketProvider` into root `layout.tsx`
4. Create basic sidebar layout shell
5. Verify `pnpm dev` starts cleanly

See `specs/02-execution-plan-frontend.md` for the full ordered task list.

---

## Cross-Repo Integration

| Repo | Relationship |
|---|---|
| `biotech-research-ingestion` | Backend — consumes its REST API and Socket.IO namespace |
| `biotech-meta` | Specs originate here; this repo implements them |
| `biotech-infra` | Deployment — Docker, reverse proxy, env injection |
