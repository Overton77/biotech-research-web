"use client";

import { useEffect } from "react";
import { useSocket } from "@/providers/SocketProvider";
import { usePlanStore } from "@/stores/planStore";
import type { ResearchPlan } from "@/types/api";
import { PlanActions } from "./PlanActions";

interface PlanReviewPanelProps {
  threadId: string;
}

export function PlanReviewPanel({ threadId }: PlanReviewPanelProps) {
  const socket = useSocket();
  const { currentPlan, interruptId, isPanelOpen, closePanel, setPlan } = usePlanStore();

  useEffect(() => {
    const onPlanReady = (data: { plan?: ResearchPlan; thread_id?: string; interrupt_id?: string }) => {
      if (data.thread_id !== threadId) return;
      const plan = data.plan as ResearchPlan | undefined;
      if (plan) setPlan(plan, data.interrupt_id ?? null);
    };
    socket.on("plan_ready", onPlanReady);
    return () => {
      socket.off("plan_ready", onPlanReady);
    };
  }, [socket, threadId, setPlan]);

  if (!isPanelOpen) return null;

  return (
    <div className="w-full lg:w-96 border-l border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-950">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-semibold">Research plan</h3>
        <button
          type="button"
          onClick={closePanel}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentPlan && (
          <>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentPlan.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{currentPlan.objective}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Stages</p>
              <ul className="mt-1 list-disc list-inside text-sm">
                {currentPlan.stages?.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tasks</p>
              <ul className="mt-2 space-y-2">
                {currentPlan.tasks?.map((t) => (
                  <li
                    key={t.id}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm"
                  >
                    <p className="font-medium">{t.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 mt-0.5">{t.description}</p>
                    <span className="inline-block mt-1 text-xs text-gray-500">{t.stage}</span>
                  </li>
                ))}
              </ul>
            </div>
            {interruptId && (
              <PlanActions
                threadId={threadId}
                interruptId={interruptId}
                plan={currentPlan}
                onClose={closePanel}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
