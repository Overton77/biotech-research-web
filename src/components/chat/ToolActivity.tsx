"use client";

export function ToolActivity({ toolName }: { toolName: string | null }) {
  if (!toolName) return null;
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-300">
        <span className="flex gap-0.5">
          <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" />
        </span>
        <span>
          Using <span className="font-medium">{toolName}</span>
        </span>
      </div>
    </div>
  );
}
