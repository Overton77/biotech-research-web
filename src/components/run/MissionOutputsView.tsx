"use client";

import { useState } from "react";
import { useMissionOutputs, useMissionRuns } from "@/lib/queries";

interface MissionOutputsViewProps {
  missionId: string;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        {title}
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4 border-t border-border">{children}</div>}
    </div>
  );
}

function CodeBlock({ content }: { content: string }) {
  return (
    <pre className="mt-2 p-3 rounded-md bg-muted text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap wrap-break-word">
      {content}
    </pre>
  );
}

export function MissionOutputsView({ missionId }: MissionOutputsViewProps) {
  const { data: outputs, isLoading, error } = useMissionOutputs(missionId);
  const { data: runs } = useMissionRuns(missionId);

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-muted/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
          Failed to load outputs. They may not be available yet.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-base font-semibold">Mission Outputs</h2>

      {outputs?.final_report_markdown && (
        <CollapsibleSection title="Final Report (Markdown)" defaultOpen>
          <div className="mt-2 prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm">{outputs.final_report_markdown}</pre>
          </div>
        </CollapsibleSection>
      )}

      {outputs?.summary && (
        <CollapsibleSection title="Summary">
          <CodeBlock content={JSON.stringify(outputs.summary, null, 2)} />
        </CollapsibleSection>
      )}

      {outputs?.mission && (
        <CollapsibleSection title="Mission Mongo Document">
          <CodeBlock content={JSON.stringify(outputs.mission, null, 2)} />
        </CollapsibleSection>
      )}

      {outputs?.stage_reports && outputs.stage_reports.length > 0 && (
        <CollapsibleSection title="Stage Reports">
          <CodeBlock content={JSON.stringify(outputs.stage_reports, null, 2)} />
        </CollapsibleSection>
      )}

      {outputs?.artifacts && outputs.artifacts.length > 0 && (
        <CollapsibleSection title="Artifacts">
          <CodeBlock content={JSON.stringify(outputs.artifacts, null, 2)} />
        </CollapsibleSection>
      )}

      {outputs?.task_runs_index && (
        <CollapsibleSection title="Task Runs Index">
          <CodeBlock content={JSON.stringify(outputs.task_runs_index, null, 2)} />
        </CollapsibleSection>
      )}

      {runs && runs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Task Runs ({runs.length})</h3>
          <div className="space-y-2">
            {runs.map((r) => (
              <div
                key={r.id}
                className="border border-border rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.task_slug}</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      r.status === "completed"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Iteration {r.iteration ?? 1}
                  {r.started_at && ` | Started: ${new Date(r.started_at).toLocaleString()}`}
                  {r.completed_at && ` | Completed: ${new Date(r.completed_at).toLocaleString()}`}
                </div>
                {r.error && (
                  <p className="text-xs text-red-500 mt-1 truncate">{r.error}</p>
                )}
                {[
                  ...(r.artifacts.final_report ? [r.artifacts.final_report] : []),
                  ...r.artifacts.intermediate_files,
                  ...(r.artifacts.memory_report_json ? [r.artifacts.memory_report_json] : []),
                  ...(r.artifacts.agent_state_json ? [r.artifacts.agent_state_json] : []),
                ].length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {[
                      ...(r.artifacts.final_report ? [r.artifacts.final_report] : []),
                      ...r.artifacts.intermediate_files,
                      ...(r.artifacts.memory_report_json ? [r.artifacts.memory_report_json] : []),
                      ...(r.artifacts.agent_state_json ? [r.artifacts.agent_state_json] : []),
                    ].map((a, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        {a.filename}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!outputs?.final_report_markdown && !outputs?.summary && !outputs?.mission && (
        <div className="text-sm text-muted-foreground py-8 text-center">
          No S3 outputs available for this mission yet.
        </div>
      )}
    </div>
  );
}
