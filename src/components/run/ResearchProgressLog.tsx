"use client";

import { useRef, useEffect, useState } from "react";
import type { ResearchProgressPayload } from "@/types/api";

interface ResearchProgressLogProps {
  events: ResearchProgressPayload[];
  maxHeight?: string;
}

const EVENT_ICONS: Record<string, string> = {
  agent_started: "play",
  agent_completed: "check",
  model_response: "cpu",
  tool_start: "wrench",
  tool_end: "wrench",
  task_started: "rocket",
  task_completed: "flag",
  task_failed: "x",
};

const EVENT_COLORS: Record<string, string> = {
  agent_started: "text-blue-500",
  agent_completed: "text-emerald-500",
  model_response: "text-purple-500",
  tool_start: "text-amber-500",
  tool_end: "text-amber-600",
  task_started: "text-blue-600",
  task_completed: "text-emerald-600",
  task_failed: "text-red-500",
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "";
  }
}

function summarizeEvent(e: ResearchProgressPayload): string {
  const p = e.payload;
  switch (e.event_type) {
    case "agent_started":
      return `${p.agent_role === "subagent" ? `Subagent ${p.subagent_name}` : "Main agent"} started`;
    case "agent_completed":
      return `${p.agent_role === "subagent" ? `Subagent ${p.subagent_name}` : "Main agent"} completed`;
    case "model_response":
      return `Model response${p.content_preview ? `: ${p.content_preview.slice(0, 80)}...` : ""}`;
    case "tool_start":
      return `Tool ${p.tool_name} — started`;
    case "tool_end":
      return `Tool ${p.tool_name} — done${p.result_summary ? ` (${p.result_summary.slice(0, 60)})` : ""}`;
    case "task_started":
      return `Task ${p.task_name ?? p.task_id} started`;
    case "task_completed":
      return `Task ${p.task_name ?? p.task_id} completed`;
    case "task_failed":
      return `Task ${p.task_name ?? p.task_id} failed${p.error ? `: ${p.error.slice(0, 80)}` : ""}`;
    default:
      return e.event_type;
  }
}

export function ResearchProgressLog({ events, maxHeight = "100%" }: ResearchProgressLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!paused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length, paused]);

  return (
    <div className="flex flex-col" style={{ maxHeight }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Live Events ({events.length})
        </h3>
        <button
          onClick={() => setPaused(!paused)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {paused ? "Resume" : "Pause"} scroll
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Waiting for events...
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {events.map((e, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-2 hover:bg-muted/30 transition-colors">
                <span className="text-[10px] font-mono text-muted-foreground shrink-0 pt-0.5 w-16">
                  {formatTime(e.timestamp)}
                </span>
                <span
                  className={`text-xs font-medium shrink-0 w-24 truncate ${EVENT_COLORS[e.event_type] ?? "text-muted-foreground"}`}
                >
                  {e.event_type}
                </span>
                <span className="text-xs text-foreground/80 min-w-0 break-words">
                  {summarizeEvent(e)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
