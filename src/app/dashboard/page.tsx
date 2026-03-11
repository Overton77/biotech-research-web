"use client";

import Link from "next/link";
import { usePlans, useMissions, useRuns } from "@/lib/queries";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

function SummaryCard({
  title,
  value,
  subtitle,
  href,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border p-5 hover:bg-muted/30 transition-colors"
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </Link>
  );
}

export default function DashboardPage() {
  const { data: plans } = usePlans({ limit: 5 });
  const { data: missions } = useMissions({ limit: 5 });
  const { data: runs } = useRuns({ limit: 5 });

  const approvedPlans = plans?.items.filter((p) => p.status === "approved").length ?? 0;
  const runningMissions = missions?.items.filter((m) => m.status === "running").length ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Research Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your research plans, missions, and runs.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Plans"
          value={plans?.total ?? "—"}
          subtitle={approvedPlans > 0 ? `${approvedPlans} ready to launch` : undefined}
          href="/dashboard/plans"
        />
        <SummaryCard
          title="Missions"
          value={missions?.total ?? "—"}
          subtitle={runningMissions > 0 ? `${runningMissions} running` : undefined}
          href="/dashboard/missions"
        />
        <SummaryCard
          title="Runs"
          value={runs?.total ?? "—"}
          href="/dashboard/runs"
        />
      </div>

      {/* Recent plans */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Recent Plans</h2>
          <Link href="/dashboard/plans" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            View all
          </Link>
        </div>
        {plans?.items.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">No plans yet.</p>
        )}
        <div className="space-y-2">
          {plans?.items.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground truncate">{p.objective}</p>
              </div>
              <div className="flex items-center gap-2 ml-3 shrink-0">
                <StatusBadge status={p.status} />
                <Link href={`/threads/${p.thread_id}`} className="text-xs text-muted-foreground hover:text-foreground">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent missions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Recent Missions</h2>
          <Link href="/dashboard/missions" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            View all
          </Link>
        </div>
        {missions?.items.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">No missions yet.</p>
        )}
        <div className="space-y-2">
          {missions?.items.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{m.title}</p>
                <p className="text-xs text-muted-foreground">
                  {m.task_defs.length} tasks | {new Date(m.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3 shrink-0">
                <StatusBadge status={m.status} />
                <Link href={`/runs/${m.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  {m.status === "running" ? "Watch" : "View"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
