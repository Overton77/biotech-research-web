"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Link as LinkIcon,
  Loader,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ResearchPlan, ResearchTask, StarterSource } from "@/types/api";

function planHeroStatus(status: ResearchPlan["status"]): {
  label: string;
  className: string;
  Icon: React.ComponentType<{ className?: string }>;
} {
  const map: Record<
    ResearchPlan["status"],
    { label: string; className: string; Icon: React.ComponentType<{ className?: string }> }
  > = {
    draft: {
      label: "Draft",
      className: "bg-muted text-muted-foreground border-border",
      Icon: FileText,
    },
    pending_approval: {
      label: "Pending approval",
      className: "bg-amber-500/10 text-amber-800 border-amber-500/30 dark:text-amber-200",
      Icon: Clock,
    },
    approved: {
      label: "Approved",
      className: "bg-sky-500/10 text-sky-800 border-sky-500/30 dark:text-sky-200",
      Icon: CheckCircle2,
    },
    rejected: {
      label: "Rejected",
      className: "bg-destructive/10 text-destructive border-destructive/30",
      Icon: AlertCircle,
    },
    executing: {
      label: "Executing",
      className: "bg-violet-500/10 text-violet-800 border-violet-500/30 dark:text-violet-200",
      Icon: Loader,
    },
    complete: {
      label: "Complete",
      className: "bg-emerald-500/10 text-emerald-800 border-emerald-500/30 dark:text-emerald-200",
      Icon: CheckCircle2,
    },
    failed: {
      label: "Failed",
      className: "bg-destructive/10 text-destructive border-destructive/30",
      Icon: AlertCircle,
    },
  };
  return map[status];
}

export interface PlanSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PlanSection({
  title,
  description,
  icon,
  children,
  className = "",
}: PlanSectionProps) {
  return (
    <section className={cn("mb-10", className)}>
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
        </div>
        {description && (
          <p className="ml-0 text-base leading-relaxed text-muted-foreground sm:ml-9">
            {description}
          </p>
        )}
      </div>
      <div className="sm:ml-9">{children}</div>
    </section>
  );
}

export interface PlanTaskAccordionItemProps {
  task: ResearchTask;
}

export function PlanTaskAccordionItem({ task }: PlanTaskAccordionItemProps) {
  const stageType = task.stage_type?.replace(/_/g, " ") ?? "Stage TBD";

  return (
    <AccordionItem
      value={task.id}
      className="mb-3 rounded-lg border border-border px-4"
    >
      <AccordionTrigger className="py-4 hover:no-underline">
        <div className="flex flex-1 flex-col gap-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-medium text-foreground">{task.title}</h4>
            <Badge variant="outline" className="text-xs capitalize">
              {stageType}
            </Badge>
          </div>
          {task.description && (
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Stage: <span className="text-foreground/90">{task.stage}</span>
            {task.estimated_duration_minutes != null && (
              <>
                {" "}
                · ~{task.estimated_duration_minutes} min
              </>
            )}
          </p>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 text-sm leading-relaxed text-foreground">
          <p className="whitespace-pre-wrap">{task.description}</p>
          {task.dependencies.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Dependencies
              </p>
              <p className="font-mono text-xs">{task.dependencies.join(", ")}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {task.selected_tool_names?.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs font-normal">
                {t}
              </Badge>
            ))}
          </div>
          {task.selected_subagent_names &&
            task.selected_subagent_names.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Subagents
                </p>
                <div className="flex flex-wrap gap-2">
                  {task.selected_subagent_names.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="text-xs font-normal"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export interface PlanSourceRowProps {
  source: StarterSource;
}

export function PlanSourceRow({ source }: PlanSourceRowProps) {
  const title =
    source.description?.trim() || source.url || "Untitled source";

  return (
    <div className="mb-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent/40">
      <div className="flex items-start gap-3">
        <LinkIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <h4 className="font-medium leading-snug text-foreground">{title}</h4>
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex break-all text-sm text-primary hover:underline"
            >
              {source.url}
            </a>
          )}
          {source.description && source.url && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {source.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export interface ResearchPlanDetailShellProps {
  backHref: string;
  plan: ResearchPlan;
  headerActions?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export function ResearchPlanDetailShell({
  backHref,
  plan,
  headerActions,
  sidebar,
  children,
}: ResearchPlanDetailShellProps) {
  const { label, className: statusClass, Icon: StatusIcon } = planHeroStatus(
    plan.status,
  );
  const created = new Date(plan.created_at).toLocaleString();
  const updated = new Date(plan.updated_at).toLocaleString();

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-2 size-4" />
            Back to plans
          </Link>
        </Button>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              {plan.title || "Research plan"}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {plan.objective || "No objective recorded."}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <Badge
                variant="outline"
                className={cn("flex items-center gap-1.5", statusClass)}
              >
                <StatusIcon
                  className={cn(
                    "size-3.5",
                    plan.status === "executing" && "animate-spin",
                  )}
                />
                {label}
              </Badge>
              <span>Created {created}</span>
              <span className="hidden sm:inline">·</span>
              <span>Updated {updated}</span>
            </div>
          </div>
          {headerActions && (
            <div className="flex shrink-0 flex-wrap gap-2">{headerActions}</div>
          )}
        </div>

        <Separator className="my-8" />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-2 text-base leading-relaxed">
            {children}
          </div>
          {sidebar && (
            <aside className="lg:sticky lg:top-6 lg:self-start">{sidebar}</aside>
          )}
        </div>
      </div>
    </div>
  );
}
