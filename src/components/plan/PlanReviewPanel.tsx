"use client";

import { useEffect } from "react";
import { useSocket } from "@/providers/SocketProvider";
import { usePlanStore } from "@/stores/planStore";
import { PlanActions } from "./PlanActions";

interface PlanReviewPanelProps {
  threadId: string;
}

interface PlanReadyPayload {
  plan?: Record<string, unknown>;
  thread_id?: string;
  interrupt_id?: string;
}

interface MissionCompilingPayload {
  plan_id?: string;
  thread_id?: string;
}

interface MissionLaunchedPayload {
  mission_id?: string;
  plan_id?: string;
  thread_id?: string;
  workflow_id?: string;
}

interface MissionLaunchErrorPayload {
  message?: string;
  plan_id?: string;
  thread_id?: string;
}

export function PlanReviewPanel({ threadId }: PlanReviewPanelProps) {
  const socket = useSocket();
  const {
    currentPlan,
    interruptId,
    isPanelOpen,
    missionStatus,
    missionId,
    missionError,
    closePanel,
    setPlan,
    setMissionCompiling,
    setMissionLaunched,
    setMissionError,
  } = usePlanStore();

  useEffect(() => {
    const onPlanReady = (data: PlanReadyPayload) => {
      if (data.thread_id !== threadId) return;
      if (data.plan) setPlan(data.plan, data.interrupt_id ?? null);
    };

    const onMissionCompiling = (data: MissionCompilingPayload) => {
      if (data.thread_id !== threadId) return;
      setMissionCompiling();
    };

    const onMissionLaunched = (data: MissionLaunchedPayload) => {
      if (data.thread_id !== threadId) return;
      if (data.mission_id) setMissionLaunched(data.mission_id);
    };

    const onMissionLaunchError = (data: MissionLaunchErrorPayload) => {
      if (data.thread_id !== threadId) return;
      setMissionError(data.message ?? "Unknown error");
    };

    socket.on("plan_ready", onPlanReady);
    socket.on("mission_compiling", onMissionCompiling);
    socket.on("mission_launched", onMissionLaunched);
    socket.on("mission_launch_error", onMissionLaunchError);
    return () => {
      socket.off("plan_ready", onPlanReady);
      socket.off("mission_compiling", onMissionCompiling);
      socket.off("mission_launched", onMissionLaunched);
      socket.off("mission_launch_error", onMissionLaunchError);
    };
  }, [socket, threadId, setPlan, setMissionCompiling, setMissionLaunched, setMissionError]);

  if (!isPanelOpen || !currentPlan) return null;

  const plan = currentPlan;
  const tasks = (plan.tasks ?? []) as Array<Record<string, unknown>>;
  const stages = (plan.stages ?? []) as string[];

  return (
    <div className="w-full lg:w-96 shrink-0 border-l border-border flex flex-col bg-background">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm">Research Plan Review</h3>
        <button
          type="button"
          onClick={closePanel}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <p className="text-sm font-medium">{String(plan.title || "Research Plan")}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{String(plan.objective || "")}</p>
        </div>

        {stages.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Stages</p>
            <ul className="list-disc list-inside text-sm space-y-0.5">
              {stages.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {tasks.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Tasks ({tasks.length})
            </p>
            <ul className="space-y-2">
              {tasks.map((t, i) => (
                <li
                  key={String(t.id || i)}
                  className="rounded-lg border border-border p-3 text-sm"
                >
                  <p className="font-medium">{String(t.title || "")}</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-0.5 text-xs">{String(t.description || "")}</p>
                  {t.stage && (
                    <span className="inline-block mt-1 text-xs text-gray-500 bg-muted px-1.5 py-0.5 rounded">
                      {String(t.stage)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mission launch status */}
        {missionStatus === "compiling" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Compiling mission...</p>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              The LLM is compiling your research plan into an executable mission.
            </p>
          </div>
        )}

        {missionStatus === "launched" && missionId && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 p-3">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Mission launched
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              Your research mission is now running via Temporal.
            </p>
            <p className="text-xs text-emerald-500 dark:text-emerald-500 mt-1 font-mono truncate">
              {missionId}
            </p>
          </div>
        )}

        {missionStatus === "error" && missionError && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-3">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Mission launch failed
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{missionError}</p>
          </div>
        )}

        {/* Show approve/reject actions only when we have an interrupt and haven't launched yet */}
        {interruptId && missionStatus === "idle" && (
          <PlanActions
            threadId={threadId}
            interruptId={interruptId}
            plan={plan}
            onClose={closePanel}
          />
        )}
      </div>
    </div>
  );
}
