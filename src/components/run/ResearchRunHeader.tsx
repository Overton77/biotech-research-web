"use client";

import type { ResearchMission, MissionStatusSummary } from "@/types/api";

interface ResearchRunHeaderProps {
  mission?: ResearchMission;
  statusSummary?: MissionStatusSummary;
  currentTaskId?: string;
  currentSubagent?: string;
  elapsedMs?: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  running: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export function ResearchRunHeader({
  mission,
  statusSummary,
  currentTaskId,
  currentSubagent,
  elapsedMs,
}: ResearchRunHeaderProps) {
  const missionStatus = mission?.status ?? "pending";
  const isRunning = missionStatus === "running";

  return (
    <div className="px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold truncate">
            {mission?.title ?? "Research Mission"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {mission?.goal ?? "Loading..."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {elapsedMs != null && (
            <span className="text-xs text-muted-foreground font-mono">
              {formatElapsed(elapsedMs)}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[missionStatus] ?? STATUS_COLORS.pending}`}
          >
            {isRunning && (
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            )}
            {missionStatus}
          </span>
        </div>
      </div>

      {statusSummary && (
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>
            Tasks: {statusSummary.completed_tasks + statusSummary.failed_tasks}/{statusSummary.total_tasks}
          </span>
          {statusSummary.completed_tasks > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400">
              {statusSummary.completed_tasks} completed
            </span>
          )}
          {statusSummary.failed_tasks > 0 && (
            <span className="text-red-600 dark:text-red-400">
              {statusSummary.failed_tasks} failed
            </span>
          )}
          {currentTaskId && (
            <span className="text-blue-600 dark:text-blue-400">
              Running: {currentTaskId}
            </span>
          )}
          {currentSubagent && (
            <span className="text-purple-600 dark:text-purple-400">
              Subagent: {currentSubagent}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
