# Frontend ↔ Backend Model Compatibility Plan

**Date:** 2026-03-12  
**Scope:** Align frontend types and components with updated `ResearchMission` and `ResearchRun` backend models in `mission.py`.

---

## 1. What Changed in the Backend (`mission.py`)

### `ResearchMission` — new fields
| Field | Type | Status |
|---|---|---|
| `reverse_dependency_map` | `dict[str, list[str]]` | **Missing from frontend** |
| `summary` | `MissionSummary \| None` | **Missing from frontend** (new model) |

### Entirely new supporting types (not yet reflected in `src/types/api.ts`)
| Python type | Purpose |
|---|---|
| `MissionSummary` | Summary attached to a `ResearchMission` on completion |
| `InputBinding` | Typed sub-model for `TaskDef.input_bindings` |
| `MainDeepAgentConfig` | Typed config for `TaskDef.main_agent` |
| `CompiledSubAgentConfig` | Typed config entries in `TaskDef.compiled_subagents` |
| `TaskExecutionPolicy` | Typed config for `TaskDef.execution` |
| `SourceReference` | Web/paper source discovered during research |
| `QualityAssessment` | Acceptance-criteria check result |
| `FileReference` | Metadata for a file produced by an agent |
| `TaskExecutionStructuredOutput` | Structured summary of a task's output locations |
| `ResearchEvent` | Single event emitted during task/mission execution |
| `TaskResult` | Normalized output of one `TaskDef` execution (in-memory; not the persisted `ResearchRun`) |

### `ResearchRun` — no changes
The persisted `ResearchRun` document matches the frontend type exactly. No changes needed.

### `ResearchPlan` — minor gap found during audit
`plans.py → _plan_to_dict` serialises `starter_sources` but the frontend `ResearchPlan` interface is missing it.  
`ResearchPlan` itself hasn't changed per the user, but this field is already live in the API response.

### `TaskDef` — currently typed as `Record<string, unknown>` for sub-objects
`main_agent`, `compiled_subagents`, and `execution` are typed as opaque objects. Now that the backing models are stable they can be properly typed.

---

## 2. Files to Change and How

### 2.1 `src/types/api.ts` — primary target

**Add new interfaces (in dependency order):**

```
InputBinding
MainDeepAgentConfig
CompiledSubAgentConfig
TaskExecutionPolicy
FileReference
TaskExecutionStructuredOutput
ResearchEvent
SourceReference
QualityAssessment
MissionSummary
TaskResult
StarterSource
```

**Update existing interfaces:**

- `TaskDef`
  - `input_bindings: Record<string, InputBinding>` (was `Record<string, unknown>`)
  - `main_agent: MainDeepAgentConfig` (was `Record<string, unknown>`)
  - `compiled_subagents: CompiledSubAgentConfig[]` (was `Record<string, unknown>[]`)
  - `execution: TaskExecutionPolicy` (was `Record<string, unknown>`)

- `ResearchMission`
  - Add `reverse_dependency_map: Record<string, string[]>`
  - Add `summary?: MissionSummary`

- `ResearchPlan`
  - Add `starter_sources: StarterSource[]`

- `ResearchProgressPayload.payload`
  - Add `duration_seconds?: number` (emitted in `task_completed` events)
  - Add `artifact_count?: number` (emitted in `task_completed` events)

### 2.2 `src/lib/api.ts` — no changes needed
All API call signatures are correct. Return types flow from `api.ts` automatically.

### 2.3 `src/lib/queries.ts` — no changes needed
All hooks reference the right types. No structural changes.

### 2.4 `src/components/run/ResearchProgressLog.tsx`

**Update `summarizeEvent` for `task_completed`:**  
The backend now emits `duration_seconds` and `artifact_count` in the `task_completed` payload. Surface these in the log line:
> "Task X completed (12.4s, 3 artifacts)"

**Add `task_failed` color mapping** (already in `EVENT_ICONS` but confirm it is in `EVENT_COLORS` too — it is, no change).

---

## 3. Files NOT changing

| File | Reason |
|---|---|
| `src/lib/api.ts` | All endpoints and return types correct |
| `src/lib/queries.ts` | Hooks are structurally sound |
| `src/components/run/ResearchRunHeader.tsx` | Uses `mission.title`, `mission.goal`, `mission.status` — all still present |
| `src/components/run/TaskStatusStrip.tsx` | Derives status from task IDs; no model dependency |
| `src/components/run/MissionOutputsView.tsx` | Uses `ResearchRun` fields that haven't changed |

---

## 4. Implementation Order

1. `src/types/api.ts` — add all new types, update `TaskDef`, `ResearchMission`, `ResearchPlan`, `ResearchProgressPayload`
2. `src/components/run/ResearchProgressLog.tsx` — update `summarizeEvent` for `task_completed` enrichment

---

## 5. Out of Scope

- Displaying `MissionSummary` in any component (just typed for now)
- Displaying `SourceReference` or `QualityAssessment` (just typed for now)
- Displaying `structured_execution_summary` (just typed for now; `TaskRunOutputs` returns it as `Record<string, unknown>`)
- Any new pages or routes
