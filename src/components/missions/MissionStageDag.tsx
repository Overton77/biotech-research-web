"use client";

import "@xyflow/react/dist/style.css";

import { useEffect, useMemo, type CSSProperties } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Node,
} from "@xyflow/react";
import type { ResearchMission } from "@/types/api";
import { buildMissionStageDag, type StageDagNodeData } from "./mission-dag/build-mission-dag";
import { StageDagNode } from "./mission-dag/StageDagNode";

const nodeTypes = { stage: StageDagNode };

function minimapNodeClass(node: Node) {
  const st = (node.data as StageDagNodeData | undefined)?.status;
  if (st === "failed") return "!fill-red-400/80";
  if (st === "running") return "!fill-blue-400/80";
  if (st === "completed") return "!fill-emerald-400/80";
  return "!fill-muted-foreground/35";
}

function MissionStageDagCanvas({ mission }: { mission: ResearchMission }) {
  const laidOut = useMemo(() => buildMissionStageDag(mission), [mission]);
  const [nodes, setNodes, onNodesChange] = useNodesState(laidOut.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(laidOut.edges);
  const { fitView } = useReactFlow();

  useEffect(() => {
    setNodes(laidOut.nodes);
    setEdges(laidOut.edges);
  }, [laidOut, setNodes, setEdges]);

  useEffect(() => {
    if (laidOut.nodes.length === 0) return;
    const handle = requestAnimationFrame(() => {
      fitView({ padding: 0.18, duration: 200 });
    });
    return () => cancelAnimationFrame(handle);
  }, [laidOut.nodes, laidOut.edges, fitView]);

  if (laidOut.nodes.length === 0) {
    return (
      <div className="flex h-[min(420px,50vh)] min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/15 px-4 text-center text-sm text-muted-foreground">
        No stages to graph yet. Stage dependencies appear here once the mission has task definitions or run
        records.
      </div>
    );
  }

  return (
    <div
      className="h-[min(520px,58vh)] min-h-[280px] w-full rounded-lg border border-border overflow-hidden bg-muted/10"
      style={
        {
          ["--dag-edge-stroke" as string]: "color-mix(in oklch, var(--primary) 78%, var(--foreground))",
        } as CSSProperties
      }
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        zoomOnScroll
        fitView={false}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          style: {
            stroke: "var(--dag-edge-stroke, var(--foreground))",
            strokeWidth: 2.5,
            strokeOpacity: 0.9,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 22,
            height: 22,
            color: "var(--dag-edge-stroke, var(--foreground))",
          },
        }}
        className="!bg-transparent"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} className="!bg-transparent" />
        <Controls className="!border-border !bg-card/95 !shadow-md" showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeClassName={minimapNodeClass}
          maskColor="rgba(0,0,0,0.06)"
          className="!border !border-border !rounded-md !bg-card/90"
        />
      </ReactFlow>
    </div>
  );
}

export function MissionStageDag({ mission }: { mission: ResearchMission }) {
  return (
    <ReactFlowProvider>
      <MissionStageDagCanvas mission={mission} />
    </ReactFlowProvider>
  );
}
