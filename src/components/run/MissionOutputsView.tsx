"use client";

import { useState } from "react";
import { useMissionOutputs, useMissionRuns } from "@/lib/queries";
import { MarkdownBody } from "@/components/missions/MarkdownBody";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

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
    <div className="border border-border rounded-xl overflow-hidden bg-card/30">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        {title}
        <svg
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="border-t border-border px-4 py-4">{children}</div>}
    </div>
  );
}

function ArticleFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <header className="mb-4 border-b border-border pb-3">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
      </header>
      {children}
    </article>
  );
}

export function MissionOutputsView({ missionId }: MissionOutputsViewProps) {
  const { data: outputs, isLoading, error } = useMissionOutputs(missionId);
  const { data: runs } = useMissionRuns(missionId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
        Failed to load outputs. They may not be available yet.
      </div>
    );
  }

  const summary = outputs?.summary;

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Reports and summaries are rendered as readable articles. Raw payloads stay behind collapsible sections.
      </p>

      {outputs?.final_report_markdown ? (
        <ArticleFrame title="Final report" subtitle="Synthesized mission output (markdown)">
          <MarkdownBody markdown={outputs.final_report_markdown} />
        </ArticleFrame>
      ) : null}

      {summary ? (
        <ArticleFrame title="Execution summary" subtitle="Task completion snapshot">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Mission status</dt>
              <dd className="mt-1">
                <StatusBadge status={summary.status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tasks</dt>
              <dd className="mt-1 tabular-nums">
                {summary.completed_tasks} completed · {summary.failed_tasks} failed · {summary.running_tasks}{" "}
                running · {summary.pending_tasks} pending · {summary.total_tasks} total
              </dd>
            </div>
          </dl>
        </ArticleFrame>
      ) : null}

      {outputs?.stage_reports && outputs.stage_reports.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Stage reports</h2>
          <div className="space-y-6">
            {outputs.stage_reports.map((sr, srIndex) => (
              <ArticleFrame
                key={`${sr.run_id}-${srIndex}`}
                title={sr.task_slug}
                subtitle={`${sr.stage_type.replace(/_/g, " ")} · iteration ${sr.iteration ?? 1} · ${sr.status}`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <StatusBadge status={sr.status} />
                </div>
                <MarkdownBody markdown={sr.final_report_text} />
              </ArticleFrame>
            ))}
          </div>
        </section>
      ) : null}

      {outputs?.artifacts && outputs.artifacts.length > 0 ? (
        <ArticleFrame title="Artifact index" subtitle="Files written during stage runs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">File</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Task</th>
                  <th className="pb-2 font-medium">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {outputs.artifacts.map((row, i) => (
                  <tr key={`${row.run_id}-${i}`}>
                    <td className="py-2 pr-4 font-mono text-xs">{row.artifact.filename}</td>
                    <td className="py-2 pr-4 text-xs">{row.artifact.artifact_type}</td>
                    <td className="py-2 pr-4 text-xs">{row.task_slug}</td>
                    <td className="py-2 text-xs tabular-nums text-muted-foreground">
                      {row.artifact.size_bytes != null ? `${row.artifact.size_bytes} B` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ArticleFrame>
      ) : null}

      {runs?.some((r) => r.memory_report) ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Per-run memory</h2>
          <div className="space-y-4">
            {runs
              .filter((r) => r.memory_report)
              .map((r) => (
                <ArticleFrame
                  key={r.id}
                  title={`Memory · ${r.task_slug}`}
                  subtitle={new Date(r.memory_report!.recorded_at).toLocaleString()}
                >
                  <p className="text-sm leading-relaxed text-foreground/90">{r.memory_report!.summary}</p>
                  {r.memory_report!.file_paths?.length ? (
                    <ul className="mt-3 list-inside list-disc text-xs text-muted-foreground">
                      {r.memory_report!.file_paths.map((fp) => (
                        <li key={fp}>{fp}</li>
                      ))}
                    </ul>
                  ) : null}
                </ArticleFrame>
              ))}
          </div>
        </section>
      ) : null}

      <CollapsibleSection title="Raw mission document (JSON)" defaultOpen={false}>
        <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 text-xs font-mono whitespace-pre-wrap wrap-break-word">
          {outputs?.mission ? JSON.stringify(outputs.mission, null, 2) : "{}"}
        </pre>
      </CollapsibleSection>

      {outputs?.task_runs_index && outputs.task_runs_index.length > 0 ? (
        <CollapsibleSection title="Task runs index (JSON)" defaultOpen={false}>
          <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 text-xs font-mono whitespace-pre-wrap wrap-break-word">
            {JSON.stringify(outputs.task_runs_index, null, 2)}
          </pre>
        </CollapsibleSection>
      ) : null}

      {!outputs?.final_report_markdown &&
        !summary &&
        (!outputs?.stage_reports || outputs.stage_reports.length === 0) &&
        !outputs?.mission && (
          <p className="py-12 text-center text-sm text-muted-foreground">No outputs available for this mission yet.</p>
        )}
    </div>
  );
}
