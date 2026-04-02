/** API and Socket.IO types matching backend. */

export interface Thread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  status: "active" | "archived";
  metadata: Record<string, unknown>;
}

export interface Message {
  id: string;
  thread_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string | ContentPart[];
  created_at: string;
  run_id?: string;
  metadata: Record<string, unknown>;
}

export interface ContentPart {
  type: string;
  text?: string;
  [key: string]: unknown;
}

export interface AgentConfig {
  model: string;
  system_prompt: string;
  tools: string[];
  backend_type: "state" | "filesystem" | "composite";
  backend_root_dir?: string;
  interrupt_on?: Record<string, unknown>;
  max_retries: number;
  timeout: number;
}

export interface StarterSource {
  url: string;
  description: string;
}

export interface ResearchTask {
  id: string;
  title: string;
  description: string;
  stage: string;
  dependencies: string[];
  estimated_duration_minutes?: number;
  selected_tool_names: string[];
  selected_subagent_names: string[];
  stage_type?:
    | "discovery"
    | "entity_validation"
    | "official_site_mapping"
    | "targeted_extraction"
    | "report_synthesis"
    | null;
}

export interface ResearchPlan {
  id: string;
  thread_id: string;
  title: string;
  objective: string;
  stages: string[];
  tasks: ResearchTask[];
  starter_sources: StarterSource[];
  context: string;
  status:
    | "draft"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "executing"
    | "complete"
    | "failed";
  mission_id?: string | null;
  workflow_id?: string | null;
  mission_status?: string | null;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approver_notes?: string;
  version: number;
}

export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  error: { code: string; message: string } | null;
}

// ---------------------------------------------------------------------------
// Paginated response (skip/limit style)
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface ArtifactRef {
  s3_uri: string;
  s3_key: string;
  local_path: string;
  artifact_type: "final_report" | "intermediate_file" | "memory_report" | "agent_state";
  filename: string;
  size_bytes?: number | null;
  uploaded_at: string;
}

export interface ResearchRun {
  id: string;
  mission_id: string;
  task_id: string;
  task_slug: string;
  parent_task_slug?: string | null;
  stage_type: string;
  targets: string[];
  dependencies: string[];
  iteration?: number | null;
  status: "running" | "completed" | "failed";
  error?: string | null;
  final_report_text: string;
  artifacts: {
    final_report?: ArtifactRef | null;
    intermediate_files: ArtifactRef[];
    memory_report_json?: ArtifactRef | null;
    agent_state_json?: ArtifactRef | null;
  };
  memory_report?: {
    mission_id: string;
    summary: string;
    file_paths: string[];
    recorded_at: string;
  } | null;
  langsmith_run_id?: string | null;
  started_at: string;
  completed_at?: string | null;
}

export interface MissionTask {
  task_id: string;
  task_slug: string;
  title: string;
  stage: string;
  dependencies: string[];
  selected_tool_names: string[];
  selected_subagent_names: string[];
  stage_type?: ResearchTask["stage_type"];
}

export interface ResearchMission {
  id: string;
  mission_id: string;
  plan_id?: string | null;
  thread_id?: string | null;
  workflow_id?: string | null;
  title: string;
  objective: string;
  mission_name: string;
  base_domain: string;
  mission_type: "stage_based" | "iterative";
  targets: string[];
  status: "running" | "completed" | "partial" | "failed";
  error?: string | null;
  task_count: number;
  completed_task_count: number;
  failed_task_count: number;
  running_task_count: number;
  tasks: MissionTask[];
  stages: ResearchRun[];
  langsmith_run_id?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

// ---------------------------------------------------------------------------
// Mission Status Summary
// ---------------------------------------------------------------------------

export interface MissionStatusSummary {
  mission_id: string;
  status: string;
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  running_tasks: number;
  pending_tasks: number;
  completed_task_ids: string[];
  failed_task_ids: string[];
  running_task_ids: string[];
}

// ---------------------------------------------------------------------------
// Mission Outputs (from S3)
// ---------------------------------------------------------------------------

export interface MissionOutputs {
  mission: ResearchMission | null;
  summary: MissionStatusSummary | null;
  final_report_markdown: string | null;
  stage_reports: Array<{
    run_id: string;
    task_id: string;
    task_slug: string;
    iteration?: number | null;
    stage_type: string;
    status: string;
    final_report_text: string;
  }>;
  artifacts: Array<{
    run_id: string;
    task_id: string;
    task_slug: string;
    iteration?: number | null;
    artifact: ArtifactRef;
  }>;
  task_runs_index: ResearchRun[];
}

export interface TaskRunOutputs {
  run: ResearchRun | null;
  resolved_inputs: Record<string, unknown> | null;
  outputs: Record<string, unknown> | null;
  events: Record<string, unknown> | null;
  source: "s3" | "mongodb";
}

// ---------------------------------------------------------------------------
// Research Progress (Socket.IO)
// ---------------------------------------------------------------------------

export interface ResearchProgressPayload {
  mission_id: string;
  event_type: string;
  payload: {
    task_id?: string;
    task_name?: string;
    subagent_name?: string;
    agent_role?: "main" | "subagent";
    tool_name?: string;
    args_summary?: string;
    result_summary?: string;
    content_preview?: string;
    message_count?: number;
    message_type?: string;
    duration_seconds?: number;
    artifact_count?: number;
    summary?: string;
    error?: string;
    status?: string;
    stage_count?: number;
    stage_slugs?: string[];
    completed_stage_slugs?: string[];
    failed_stage_slugs?: string[];
    level_index?: number;
    report_count?: number;
    plan_id?: string;
    thread_id?: string;
    workflow_id?: string;
    [key: string]: unknown;
  };
  timestamp: string;
}
