import dagre from "@dagrejs/dagre";
import { MarkerType, Position, type Edge, type Node } from "@xyflow/react";
import type { MissionTask, ResearchMission, ResearchRun } from "@/types/api";

export type StageDagNodeStatus = "pending" | "running" | "completed" | "failed";

export type StageDagNodeData = {
  label: string;
  taskSlug: string;
  stageType?: string | null;
  status: StageDagNodeStatus;
  /** Number of persisted stage runs for this slug (e.g. iterative loops). */
  runCount: number;
};

const NODE_W = 240;
const NODE_H = 96;

function aggregateRunStatus(slug: string, stages: ResearchRun[]): StageDagNodeStatus {
  const runs = stages.filter((s) => s.task_slug === slug || s.parent_task_slug === slug);
  if (runs.length === 0) return "pending";
  if (runs.some((r) => r.status === "failed")) return "failed";
  if (runs.some((r) => r.status === "running")) return "running";
  if (runs.every((r) => r.status === "completed")) return "completed";
  return "pending";
}

function runCountForSlug(slug: string, stages: ResearchRun[]): number {
  return stages.filter((s) => s.task_slug === slug || s.parent_task_slug === slug).length;
}

function collectSlugs(mission: ResearchMission): Set<string> {
  const slugs = new Set<string>();
  for (const t of mission.tasks ?? []) {
    slugs.add(t.task_slug);
    for (const d of t.dependencies ?? []) slugs.add(d);
  }
  for (const s of mission.stages ?? []) {
    slugs.add(s.task_slug);
    for (const d of s.dependencies ?? []) slugs.add(d);
  }
  return slugs;
}

const EDGE_STYLE = {
  stroke: "var(--dag-edge-stroke, var(--foreground))",
  strokeWidth: 2.5,
  strokeOpacity: 0.9,
} as const;

function buildEdges(mission: ResearchMission, slugs: Set<string>): Edge[] {
  const seen = new Set<string>();
  const edges: Edge[] = [];

  const push = (source: string, target: string) => {
    const src = source.trim();
    const tgt = target.trim();
    if (!src || !tgt || !slugs.has(src) || !slugs.has(tgt)) return;
    const id = `${src}→${tgt}`;
    if (seen.has(id)) return;
    seen.add(id);
    edges.push({
      id,
      source: src,
      target: tgt,
      type: "smoothstep",
      style: { ...EDGE_STYLE },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 22,
        height: 22,
        color: "var(--dag-edge-stroke, var(--foreground))",
      },
    });
  };

  for (const t of mission.tasks ?? []) {
    for (const d of t.dependencies ?? []) {
      push(d, t.task_slug);
    }
  }

  const firstBySlug = new Map<string, ResearchRun>();
  for (const s of mission.stages ?? []) {
    if (!firstBySlug.has(s.task_slug)) firstBySlug.set(s.task_slug, s);
  }
  for (const rec of firstBySlug.values()) {
    for (const d of rec.dependencies ?? []) {
      push(d, rec.task_slug);
    }
  }
  return edges;
}

function taskLabelMap(tasks: MissionTask[]): Map<string, { title: string; stageType?: MissionTask["stage_type"] }> {
  const m = new Map<string, { title: string; stageType?: MissionTask["stage_type"] }>();
  for (const t of tasks) {
    m.set(t.task_slug, { title: t.title, stageType: t.stage_type });
  }
  return m;
}

function layoutWithDagre(
  nodes: Node<StageDagNodeData>[],
  edges: Edge[],
): { nodes: Node<StageDagNodeData>[]; edges: Edge[] } {
  if (nodes.length === 0) return { nodes: [], edges: edges };

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "TB",
    nodesep: 48,
    ranksep: 72,
    marginx: 24,
    marginy: 24,
  });

  for (const n of nodes) {
    g.setNode(n.id, { width: NODE_W, height: NODE_H });
  }
  for (const e of edges) {
    g.setEdge(e.source, e.target);
  }

  dagre.layout(g);

  const laidOut = nodes.map((n) => {
    const nodeWithPos = g.node(n.id);
    if (!nodeWithPos) return n;
    return {
      ...n,
      position: {
        x: nodeWithPos.x - NODE_W / 2,
        y: nodeWithPos.y - NODE_H / 2,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });

  return { nodes: laidOut, edges };
}

export function buildMissionStageDag(mission: ResearchMission): {
  nodes: Node<StageDagNodeData>[];
  edges: Edge[];
} {
  const slugs = collectSlugs(mission);
  if (slugs.size === 0) {
    return { nodes: [], edges: [] };
  }

  const labels = taskLabelMap(mission.tasks ?? []);
  const stages = mission.stages ?? [];

  const baseNodes: Node<StageDagNodeData>[] = [...slugs].map((slug) => {
    const meta = labels.get(slug);
    return {
      id: slug,
      type: "stage",
      position: { x: 0, y: 0 },
      data: {
        taskSlug: slug,
        label: meta?.title?.trim() ? meta.title : slug,
        stageType: meta?.stageType ?? null,
        status: aggregateRunStatus(slug, stages),
        runCount: runCountForSlug(slug, stages),
      },
    };
  });

  const edges = buildEdges(mission, slugs);
  return layoutWithDagre(baseNodes, edges);
}

export { NODE_W, NODE_H };
