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

export interface TaskInputRef {
  name: string;
  source: "task_output" | "user_provided" | "external";
  source_task_id?: string;
  output_name?: string;
  description: string;
}

export interface TaskOutputSpec {
  name: string;
  type: "text" | "markdown" | "json" | "file" | "s3_ref";
  description: string;
  required: boolean;
}

export interface ResearchTask {
  id: string;
  title: string;
  description: string;
  stage: string;
  sub_stage?: string;
  agent_config: AgentConfig;
  inputs: TaskInputRef[];
  outputs: TaskOutputSpec[];
  dependencies: string[];
  estimated_duration_minutes?: number;
}

export interface ResearchPlan {
  id: string;
  thread_id: string;
  title: string;
  objective: string;
  stages: string[];
  tasks: ResearchTask[];
  starter_sources: StarterSource[];
  status:
    | "draft"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "executing"
    | "complete"
    | "failed";
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

// ---------------------------------------------------------------------------
// Mission model supporting types
// ---------------------------------------------------------------------------

export interface InputBinding {
  source_task_id: string;
  source_key: string;
  required: boolean;
  transform?: string;
  max_tokens?: number;
}

export interface MainDeepAgentConfig {
  model_name: string;
  model_tier: "fast" | "standard" | "powerful";
  system_prompt: string;
  tool_profile_name: string;
  filesystem_profile: string;
  memory_profile: string;
  allow_general_purpose_subagent: boolean;
  max_iterations?: number;
  skills: string[];
  notes: Record<string, unknown>;
}

export interface CompiledSubAgentConfig {
  name: string;
  description: string;
  system_prompt: string;
  model_name?: string;
  tool_profile_name: string;
  filesystem_profile: string;
  use_todo_middleware: boolean;
  memory_profile: string;
  workspace_suffix: string;
  max_invocations: number;
  expected_output_format?: string;
  expected_output_path?: string;
  skills: string[];
}

export interface TaskExecutionPolicy {
  timeout_seconds: number;
  max_retries: number;
  persist_run_after_completion: boolean;
  fallback_models: string[];
  require_human_review: boolean;
}

export interface FileReference {
  path: string;
  name?: string;
  description?: string;
}

export interface TaskExecutionStructuredOutput {
  subagent_final_output_locations: FileReference[];
  final_synthesis_reports: FileReference[];
}

export interface ResearchEvent {
  event_type: string;
  task_id?: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface SourceReference {
  url: string;
  title?: string;
  snippet?: string;
  accessed_at: string;
  relevance_score?: number;
  source_type: string;
  tool_name?: string;
  query?: string;
}

export interface QualityAssessment {
  task_id: string;
  criteria_results: Record<string, unknown>[];
  overall_pass: boolean;
  suggestions: string[];
  assessed_at: string;
}

export interface MissionSummary {
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  total_sources: number;
  total_artifacts: number;
  has_final_report: boolean;
  completed_at?: string;
}

export interface TaskResult {
  task_id: string;
  status: "completed" | "failed";
  outputs: Record<string, unknown>;
  artifacts: ArtifactRef[];
  events: ResearchEvent[];
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  attempt_number: number;
  structured_execution_summary?: TaskExecutionStructuredOutput;
  sources: SourceReference[];
  quality_assessment?: QualityAssessment;
}

// ---------------------------------------------------------------------------
// Research Mission
// ---------------------------------------------------------------------------

export interface TaskDef {
  task_id: string;
  name: string;
  stage_label?: string;
  description: string;
  depends_on: string[];
  input_bindings: Record<string, InputBinding>;
  output_schema?: Record<string, unknown>;
  acceptance_criteria: string[];
  main_agent: MainDeepAgentConfig;
  compiled_subagents: CompiledSubAgentConfig[];
  execution: TaskExecutionPolicy;
}

export interface ResearchMission {
  id: string;
  research_plan_id: string;
  thread_id: string;
  title: string;
  goal: string;
  global_context: Record<string, unknown>;
  global_constraints: string[];
  success_criteria: string[];
  task_defs: TaskDef[];
  dependency_map: Record<string, string[]>;
  reverse_dependency_map: Record<string, string[]>;
  status: "pending" | "running" | "completed" | "failed";
  summary?: MissionSummary;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Research Run
// ---------------------------------------------------------------------------

export interface ArtifactRef {
  task_id: string;
  name: string;
  artifact_type: string;
  storage: "filesystem" | "s3" | "mongo_inline";
  path?: string;
  content_inline?: string;
  content_type: string;
  created_at: string;
}

export interface ResearchRun {
  id: string;
  mission_id: string;
  task_id: string;
  attempt_number: number;
  status: "completed" | "failed";
  resolved_inputs_snapshot: Record<string, unknown>;
  outputs_snapshot: Record<string, unknown>;
  artifacts: ArtifactRef[];
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
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
  pending_tasks: number;
  completed_task_ids: string[];
  failed_task_ids: string[];
}

// ---------------------------------------------------------------------------
// Mission Outputs (from S3)
// ---------------------------------------------------------------------------

export interface MissionOutputs {
  mission: Record<string, unknown> | null;
  mission_draft: Record<string, unknown> | null;
  final_report_markdown: string | null;
  final_report_json: Record<string, unknown> | null;
  summary: Record<string, unknown> | null;
  task_runs_index: Record<string, unknown> | null;
}

export interface TaskRunOutputs {
  run: Record<string, unknown> | null;
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
    [key: string]: unknown;
  };
  timestamp: string;
}
