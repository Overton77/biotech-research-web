"use client";

export function ToolActivity({ toolName }: { toolName: string | null }) {
  if (!toolName) return null;
  return (
    <div className="flex justify-start">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
        Using: {toolName}
      </div>
    </div>
  );
}
