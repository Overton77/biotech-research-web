"use client";

interface TaskStatusStripProps {
  taskIds: string[];
  taskNames?: Record<string, string>;
  statusByTaskId: Record<string, "pending" | "running" | "completed" | "failed">;
}

const DOT_COLORS: Record<string, string> = {
  pending: "bg-gray-300 dark:bg-gray-600",
  running: "bg-blue-500 animate-pulse",
  completed: "bg-emerald-500",
  failed: "bg-red-500",
};

const LABEL_COLORS: Record<string, string> = {
  pending: "text-muted-foreground",
  running: "text-blue-600 dark:text-blue-400",
  completed: "text-emerald-600 dark:text-emerald-400",
  failed: "text-red-600 dark:text-red-400",
};

export function TaskStatusStrip({ taskIds, taskNames, statusByTaskId }: TaskStatusStripProps) {
  if (taskIds.length === 0) return null;

  return (
    <div className="px-4 py-3 border-b border-border">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Tasks
      </h3>
      <div className="flex flex-wrap gap-2">
        {taskIds.map((id) => {
          const st = statusByTaskId[id] ?? "pending";
          return (
            <div
              key={id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${DOT_COLORS[st]}`} />
              <span className={`truncate max-w-[120px] ${LABEL_COLORS[st]}`}>
                {taskNames?.[id] ?? id}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
