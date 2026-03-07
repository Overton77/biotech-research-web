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

export function PlanReviewPanel({ threadId }: PlanReviewPanelProps) {
  const socket = useSocket();
  const { currentPlan, interruptId, isPanelOpen, closePanel, setPlan } = usePlanStore();

  useEffect(() => {
    const onPlanReady = (data: PlanReadyPayload) => {
      if (data.thread_id !== threadId) return;
      if (data.plan) setPlan(data.plan, data.interrupt_id ?? null);
    };
    socket.on("plan_ready", onPlanReady);
    return () => {
      socket.off("plan_ready", onPlanReady);
    };
  }, [socket, threadId, setPlan]);

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

        {interruptId && (
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
