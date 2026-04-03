"use client";

import Link from "next/link";
import {
  ClipboardList,
  MessageSquare,
  PlayCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { KnowledgeGraphTotalsSection } from "@/components/dashboard/KnowledgeGraphTotalsSection";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePlans, useMissions, useRuns, useThreads } from "@/lib/queries";
import { cn } from "@/lib/utils";

function WorkspaceStatCard({
  title,
  value,
  subtitle,
  href,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  href: string;
  icon: LucideIcon;
  loading?: boolean;
}) {
  return (
    <Link href={href} className="group block h-full min-h-0">
      <Card
        className={cn(
          "h-full gap-0 py-5 shadow-sm transition-colors",
          "hover:border-primary/25 hover:bg-muted/15",
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 px-5 pb-3 pt-0">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </CardTitle>
            {subtitle && <CardDescription className="text-xs">{subtitle}</CardDescription>}
          </div>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
            aria-hidden
          >
            <Icon className="size-[18px]" strokeWidth={1.75} />
          </span>
        </CardHeader>
        <CardContent className="px-5 pb-0 pt-0">
          <p
            className={cn(
              "text-3xl font-semibold tabular-nums tracking-tight",
              loading && "animate-pulse rounded-md bg-muted h-9 w-20",
            )}
          >
            {!loading && value}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: plans } = usePlans({ limit: 5 });
  const { data: missions } = useMissions({ limit: 5 });
  const { data: runs } = useRuns({ limit: 5 });
  const { data: threads } = useThreads();

  const approvedPlans = plans?.items.filter((p) => p.status === "approved").length ?? 0;
  const runningMissions = missions?.items.filter((m) => m.status === "running").length ?? 0;

  const chatsLoading = threads === undefined;
  const plansLoading = plans === undefined;
  const missionsLoading = missions === undefined;
  const runsLoading = runs === undefined;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Research Dashboard</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Coordinator chats, research plans, missions, and runs—plus a live view of knowledge graph
          entity coverage.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Workspace</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <WorkspaceStatCard
            title="Chats"
            value={threads?.items.length ?? "—"}
            subtitle="Coordinator threads"
            href="/dashboard/chats"
            icon={MessageSquare}
            loading={chatsLoading}
          />
          <WorkspaceStatCard
            title="Plans"
            value={plans?.total ?? "—"}
            subtitle={approvedPlans > 0 ? `${approvedPlans} approved` : "Research plans"}
            href="/dashboard/plans"
            icon={ClipboardList}
            loading={plansLoading}
          />
          <WorkspaceStatCard
            title="Missions"
            value={missions?.total ?? "—"}
            subtitle={runningMissions > 0 ? `${runningMissions} running` : "Mission runs"}
            href="/dashboard/missions"
            icon={Zap}
            loading={missionsLoading}
          />
          <WorkspaceStatCard
            title="Runs"
            value={runs?.total ?? "—"}
            subtitle="Execution history"
            href="/dashboard/runs"
            icon={PlayCircle}
            loading={runsLoading}
          />
        </div>
      </section>

      <KnowledgeGraphTotalsSection />

      <section>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
            <div>
              <CardTitle className="text-base">Recent plans</CardTitle>
              <CardDescription>Latest research plans in your workspace</CardDescription>
            </div>
            <Link
              href="/dashboard/plans"
              className="text-xs font-medium text-primary hover:underline shrink-0"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            {plans?.items.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">No plans yet.</p>
            )}
            <div className="space-y-2">
              {plans?.items.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/10 px-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.objective}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-1 shrink-0">
                    <StatusBadge status={p.status} />
                    <Link
                      href={`/dashboard/plans/${p.id}`}
                      className="text-xs text-primary hover:underline whitespace-nowrap"
                    >
                      Open
                    </Link>
                    <Link
                      href={`/threads/${p.thread_id}`}
                      className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                    >
                      Thread
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
            <div>
              <CardTitle className="text-base">Recent missions</CardTitle>
              <CardDescription>Latest missions and their status</CardDescription>
            </div>
            <Link
              href="/dashboard/missions"
              className="text-xs font-medium text-primary hover:underline shrink-0"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            {missions?.items.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">No missions yet.</p>
            )}
            <div className="space-y-2">
              {missions?.items.map((m, index) => (
                <div
                  key={m.document_id ?? `${m.mission_id}-${m.created_at}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/10 px-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.task_count} tasks · {new Date(m.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-1 shrink-0">
                    <StatusBadge status={m.status} />
                    <Link
                      href={`/dashboard/missions/${m.id}`}
                      className="text-xs text-primary hover:underline whitespace-nowrap"
                    >
                      {m.status === "running" ? "Watch" : "View"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
