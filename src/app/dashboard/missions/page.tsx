"use client";

import { useState } from "react";
import { useMissions } from "@/lib/queries";
import { Pagination } from "@/components/dashboard/Pagination";
import { MissionCard } from "@/components/missions/MissionCard";

const PAGE_SIZE = 12;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "partial", label: "Partial" },
  { value: "failed", label: "Failed" },
];

export default function MissionsListPage() {
  const [skip, setSkip] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [minTasks, setMinTasks] = useState("");
  const [maxTasks, setMaxTasks] = useState("");

  const minParsed = minTasks === "" ? undefined : Number.parseInt(minTasks, 10);
  const maxParsed = maxTasks === "" ? undefined : Number.parseInt(maxTasks, 10);

  const { data, isLoading } = useMissions({
    skip,
    limit: PAGE_SIZE,
    status_filter: statusFilter || undefined,
    min_task_count:
      minParsed !== undefined && !Number.isNaN(minParsed) ? minParsed : undefined,
    max_task_count:
      maxParsed !== undefined && !Number.isNaN(maxParsed) ? maxParsed : undefined,
  });

  return (
    <div className="p-6 max-w-6xl mx-auto pb-16">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Research missions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Filter by status and planned task count. Open a mission for the full record, live progress, and outputs.
          </p>
        </div>
      </div>

      <div className="mb-8 space-y-3 rounded-xl border border-border bg-card/40 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex min-w-[160px] flex-1 flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            Status
            <select
              value={statusFilter}
              onChange={(e) => {
              setStatusFilter(e.target.value);
              setSkip(0);
            }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex w-full min-w-[100px] max-w-[140px] flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            Min tasks
            <input
              type="number"
              min={0}
              placeholder="Any"
              value={minTasks}
              onChange={(e) => {
                setMinTasks(e.target.value);
                setSkip(0);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            />
          </label>
          <label className="flex w-full min-w-[100px] max-w-[140px] flex-col gap-1.5 text-xs font-medium text-muted-foreground">
            Max tasks
            <input
              type="number"
              min={0}
              placeholder="Any"
              value={maxTasks}
              onChange={(e) => {
                setMaxTasks(e.target.value);
                setSkip(0);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            />
          </label>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Task count filters use the stored expected task count on each mission. Older missions without that field may
          not appear when a min or max is set.
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-xl bg-muted/60 animate-pulse" />
          ))}
        </div>
      )}

      {data && data.items.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">No missions match your filters.</p>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.items.map((m, index) => (
              <MissionCard
                key={m.document_id ?? `${m.mission_id}-${m.created_at}-${index}`}
                mission={m}
                detailHref={`/dashboard/missions/${m.id}`}
                planHref={m.plan_id ? `/dashboard/plans/${m.plan_id}` : null}
                threadHref={m.thread_id ? `/threads/${m.thread_id}` : null}
              />
            ))}
          </div>
          <div className="mt-8">
            <Pagination skip={skip} limit={PAGE_SIZE} total={data.total} onPageChange={setSkip} />
          </div>
        </>
      )}
    </div>
  );
}
