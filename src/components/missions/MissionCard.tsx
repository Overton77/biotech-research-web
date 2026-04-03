"use client";

import Link from "next/link";
import { ExternalLink, FileText, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { ResearchMission } from "@/types/api";

const TARGETS_VISIBLE = 3;

export interface MissionCardProps {
  mission: ResearchMission;
  detailHref: string;
  planHref?: string | null;
  threadHref?: string | null;
}

export function MissionCard({ mission, detailHref, planHref, threadHref }: MissionCardProps) {
  const total = mission.task_count > 0 ? mission.task_count : 1;
  const done = Math.min(mission.completed_task_count + mission.failed_task_count, mission.task_count);
  const pct = mission.task_count > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const targets = mission.targets ?? [];
  const shown = targets.slice(0, TARGETS_VISIBLE);
  const more = targets.length - shown.length;

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="gap-2 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="line-clamp-2 text-base leading-snug">{mission.title}</CardTitle>
          <StatusBadge status={mission.status} />
        </div>
        <CardDescription className="line-clamp-3">{mission.objective || "—"}</CardDescription>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="outline" className="text-[10px] font-normal capitalize">
            {mission.mission_type.replace("_", " ")}
          </Badge>
          {mission.base_domain ? (
            <Badge variant="secondary" className="text-[10px] font-normal">
              {mission.base_domain}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pb-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Task progress</span>
            <span className="font-medium tabular-nums">
              {mission.completed_task_count}/{mission.task_count} done
              {mission.failed_task_count > 0 ? (
                <span className="text-destructive ml-1">({mission.failed_task_count} failed)</span>
              ) : null}
            </span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>

        {shown.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Targets</p>
            <div className="flex flex-wrap gap-1.5">
              {shown.map((t) => (
                <Badge key={t} variant="secondary" className="max-w-[140px] truncate text-[10px] font-normal">
                  {t}
                </Badge>
              ))}
              {more > 0 ? (
                <Badge variant="outline" className="text-[10px] font-normal">
                  +{more} more
                </Badge>
              ) : null}
            </div>
          </div>
        ) : null}

        <p className="mt-auto text-[11px] text-muted-foreground">
          Created {new Date(mission.created_at).toLocaleString()}
        </p>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button asChild size="sm" className="flex-1 min-w-[120px]">
          <Link href={detailHref}>
            <ExternalLink className="size-4" />
            Open mission
          </Link>
        </Button>
        {planHref ? (
          <Button asChild variant="outline" size="sm">
            <Link href={planHref}>
              <FileText className="size-4" />
              Plan
            </Link>
          </Button>
        ) : null}
        {threadHref ? (
          <Button asChild variant="outline" size="sm">
            <Link href={threadHref}>
              <MessageSquare className="size-4" />
              Thread
            </Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
