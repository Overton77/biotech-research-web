"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  FileSearch,
  FileText,
  Loader,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResearchPlan } from "@/types/api";

function planStatusPresentation(status: ResearchPlan["status"]): {
  label: string;
  className: string;
  Icon: LucideIcon;
} {
  const map: Record<
    ResearchPlan["status"],
    { label: string; className: string; Icon: LucideIcon }
  > = {
    draft: {
      label: "Draft",
      className: "bg-muted text-muted-foreground border-border",
      Icon: FileText,
    },
    pending_approval: {
      label: "Pending approval",
      className: "bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-300",
      Icon: Clock,
    },
    approved: {
      label: "Approved",
      className: "bg-sky-500/10 text-sky-700 border-sky-500/25 dark:text-sky-300",
      Icon: CheckCircle2,
    },
    rejected: {
      label: "Rejected",
      className: "bg-destructive/10 text-destructive border-destructive/25",
      Icon: AlertCircle,
    },
    executing: {
      label: "Executing",
      className: "bg-violet-500/10 text-violet-700 border-violet-500/25 dark:text-violet-300",
      Icon: Loader,
    },
    complete: {
      label: "Complete",
      className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300",
      Icon: CheckCircle2,
    },
    failed: {
      label: "Failed",
      className: "bg-destructive/10 text-destructive border-destructive/25",
      Icon: AlertCircle,
    },
  };
  return map[status];
}

export interface ResearchPlanCardProps {
  plan: ResearchPlan;
  onOpen?: () => void;
  children?: React.ReactNode;
}

export function ResearchPlanCard({
  plan,
  onOpen,
  children,
}: ResearchPlanCardProps) {
  const objective = plan.objective?.trim() || "No objective set.";
  const { label, className: statusClass, Icon: StatusIcon } =
    planStatusPresentation(plan.status);
  const runKg = plan.run_kg === true;
  const unstructuredEnabled = plan.unstructured_ingestion?.enabled === true;
  const updatedLabel = new Date(plan.updated_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Card className="group border-border bg-card transition-all duration-300 hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg font-semibold text-foreground">
            {plan.title || "Untitled plan"}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn("flex shrink-0 items-center gap-1 border", statusClass)}
          >
            <StatusIcon
              className={cn("size-3", plan.status === "executing" && "animate-spin")}
            />
            <span className="max-w-36 truncate text-xs font-medium">
              {label}
            </span>
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {objective}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/40 p-3">
            <span className="mb-1 text-xs font-medium text-muted-foreground">
              Tasks
            </span>
            <span className="text-lg font-semibold text-foreground">
              {plan.tasks?.length ?? 0}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/40 p-3">
            <span className="mb-1 text-xs font-medium text-muted-foreground">
              Stages
            </span>
            <span className="text-lg font-semibold text-foreground">
              {plan.stages?.length ?? 0}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/40 p-3">
            <span className="mb-1 text-xs font-medium text-muted-foreground">
              Sources
            </span>
            <span className="text-lg font-semibold text-foreground">
              {plan.starter_sources?.length ?? 0}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {runKg && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Database className="size-3" />
                KG
              </Badge>
            )}
            {unstructuredEnabled && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <FileSearch className="size-3" />
                Unstructured
              </Badge>
            )}
            {plan.mission_id && (
              <Badge variant="outline" className="text-xs">
                Mission linked
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">v{plan.version}</span>
        </div>

        <p className="text-xs text-muted-foreground">Updated {updatedLabel}</p>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {onOpen && (
          <Button type="button" onClick={onOpen} variant="default" className="flex-1">
            Open plan
          </Button>
        )}
        {children}
      </CardFooter>
    </Card>
  );
}

export function ResearchPlanCardGrid({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
