"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { memo } from "react";
import { cn } from "@/lib/utils";
import type { StageDagNodeData } from "./build-mission-dag";

const STATUS_RING: Record<StageDagNodeData["status"], string> = {
  pending: "border-border bg-card/90 shadow-sm",
  running: "border-blue-500/70 bg-blue-500/5 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]",
  completed: "border-emerald-500/55 bg-emerald-500/5",
  failed: "border-red-500/60 bg-red-500/5",
};

const STATUS_DOT: Record<StageDagNodeData["status"], string> = {
  pending: "bg-muted-foreground/40",
  running: "bg-blue-500 animate-pulse",
  completed: "bg-emerald-500",
  failed: "bg-red-500",
};

function StageDagNodeInner({ data }: NodeProps<Node<StageDagNodeData>>) {
  return (
    <div
      className={cn(
        "w-[240px] rounded-xl border px-3 py-2.5 text-left transition-colors",
        STATUS_RING[data.status],
      )}
    >
      <Handle type="target" position={Position.Top} className="!size-2 !border-border !bg-background" />
      <div className="flex items-start gap-2">
        <span
          className={cn("mt-1.5 size-2 shrink-0 rounded-full", STATUS_DOT[data.status])}
          title={data.status}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-snug text-foreground line-clamp-2">{data.label}</p>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground truncate" title={data.taskSlug}>
            {data.taskSlug}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {data.stageType ? (
              <span className="rounded-md bg-muted/80 px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                {data.stageType.replace(/_/g, " ")}
              </span>
            ) : null}
            {data.runCount > 1 ? (
              <span className="text-[10px] text-muted-foreground">{data.runCount} runs</span>
            ) : null}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!size-2 !border-border !bg-background" />
    </div>
  );
}

export const StageDagNode = memo(StageDagNodeInner);
