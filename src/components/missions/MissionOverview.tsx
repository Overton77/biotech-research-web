"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { MissionStageDag } from "@/components/missions/MissionStageDag";
import type { ResearchMission } from "@/types/api";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-border py-3 text-sm last:border-0 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 wrap-break-word">{children}</dd>
    </div>
  );
}

export function MissionOverview({
  mission,
  showDag,
}: {
  mission: ResearchMission;
  showDag?: boolean;
}) {
  return (
    <div className="space-y-6">
      {mission.error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {mission.error}
        </div>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Mission record
        </h2>
        <dl>
          <Row label="Status">
            <StatusBadge status={mission.status} />
          </Row>
          <Row label="Mission ID">
            <code className="text-xs">{mission.mission_id}</code>
          </Row>
          <Row label="Mission name">{mission.mission_name || "—"}</Row>
          <Row label="Type">
            <span className="capitalize">
              {mission.mission_type.replace("_", " ")}
            </span>
          </Row>
          <Row label="Objective">{mission.objective || "—"}</Row>
          <Row label="Base domain">{mission.base_domain || "—"}</Row>
          <Row label="Targets">
            {mission.targets?.length ? (
              <ul className="list-inside list-disc text-muted-foreground">
                {mission.targets.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : (
              "—"
            )}
          </Row>
          <Row label="Tasks">
            {mission.completed_task_count}/{mission.task_count} completed
            {mission.failed_task_count > 0 ? (
              <span className="text-destructive">
                {" "}
                · {mission.failed_task_count} failed
              </span>
            ) : null}
            {mission.running_task_count > 0 ? (
              <span className="text-blue-600 dark:text-blue-400">
                {" "}
                · {mission.running_task_count} running
              </span>
            ) : null}
          </Row>
          <Row label="Plan">
            {mission.plan_id ? (
              <Link
                className="text-primary hover:underline"
                href={`/dashboard/plans/${mission.plan_id}`}
              >
                Open plan
              </Link>
            ) : (
              "—"
            )}
          </Row>
          <Row label="Thread">
            {mission.thread_id ? (
              <Link
                className="text-primary hover:underline"
                href={`/threads/${mission.thread_id}`}
              >
                Open thread
              </Link>
            ) : (
              "—"
            )}
          </Row>
          <Row label="Workflow ID">
            {mission.workflow_id ? (
              <code className="text-xs">{mission.workflow_id}</code>
            ) : (
              "—"
            )}
          </Row>
          <Row label="LangSmith run">
            {mission.langsmith_run_id ? (
              <code className="text-xs">{mission.langsmith_run_id}</code>
            ) : (
              "—"
            )}
          </Row>
          <Row label="Created">
            {new Date(mission.created_at).toLocaleString()}
          </Row>
          <Row label="Updated">
            {new Date(mission.updated_at).toLocaleString()}
          </Row>
          <Row label="Completed">
            {mission.completed_at
              ? new Date(mission.completed_at).toLocaleString()
              : "—"}
          </Row>
          {mission.expected_task_count != null ? (
            <Row label="Expected tasks (filter)">
              {mission.expected_task_count}
            </Row>
          ) : null}
        </dl>
      </section>
      {showDag ? (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="mb-1 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Stage pipeline
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Directed graph from stage dependencies (edges point from a
            dependency to the stage that waits on it). Node color reflects the
            latest run status from mission stages.
          </p>
          <MissionStageDag mission={mission} />
        </section>
      ) : (
        <p className="text-xs text-muted-foreground">
          Show Dag Not Enabled 
        </p>
      )}

      {mission.tasks?.length ? (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Task definitions
          </h2>
          <div className="space-y-3">
            {mission.tasks.map((t) => (
              <div
                key={t.task_id}
                className="rounded-lg border border-border/80 bg-muted/20 p-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{t.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {t.stage_type ?? t.stage}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {t.task_slug}
                </p>
                {t.dependencies?.length ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Depends on: {t.dependencies.join(", ")}
                  </p>
                ) : null}
                {t.selected_tool_names?.length ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tools: {t.selected_tool_names.join(", ")}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
