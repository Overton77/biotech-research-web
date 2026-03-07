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
