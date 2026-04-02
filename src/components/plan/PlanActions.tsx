"use client";

import { useEffect, useMemo, useState } from "react";
import { useSocket } from "@/providers/SocketProvider";
import {
  type ResearchPlan,
  type ResearchTask,
  type StarterSource,
} from "@/types/api";
import {
  useApprovePlanMutation,
  useSaveAndApprovePlanMutation,
  useUpdatePlanMutation,
} from "@/lib/mutations";

interface PlanActionsProps {
  threadId: string;
  interruptId: string;
  plan: ResearchPlan;
  onClose: () => void;
}

function makeEmptyStarterSource(): StarterSource {
  return {
    url: "",
    description: "",
  };
}

function parseCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function makeEmptyTask(): ResearchTask {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    stage: "",
    dependencies: [],
    estimated_duration_minutes: undefined,
    selected_tool_names: ["search_web", "extract_from_urls", "map_website"],
    selected_subagent_names: [],
    stage_type: null,
  };
}

function normalizePlanForEdit(plan: ResearchPlan): ResearchPlan {
  return {
    ...plan,
    context: plan.context ?? "",
    approver_notes: plan.approver_notes ?? "",
    starter_sources: plan.starter_sources ?? [],
    stages: plan.stages ?? [],
    tasks: (plan.tasks ?? []).map((task) => ({
      ...task,
      dependencies: task.dependencies ?? [],
      selected_tool_names: task.selected_tool_names ?? [],
      selected_subagent_names: task.selected_subagent_names ?? [],
      estimated_duration_minutes: task.estimated_duration_minutes,
    })),
  };
}

export function PlanActions({
  threadId,
  interruptId,
  plan,
  onClose,
}: PlanActionsProps) {
  const socket = useSocket();

  const [notes, setNotes] = useState("");
  const [editedPlan, setEditedPlan] = useState<ResearchPlan>(() =>
    normalizePlanForEdit(plan),
  );

  const updatePlanMutation = useUpdatePlanMutation();
  const approvePlanMutation = useApprovePlanMutation();
  const saveAndApprovePlanMutation = useSaveAndApprovePlanMutation();

  useEffect(() => {
    setEditedPlan(normalizePlanForEdit(plan));
  }, [plan]);

  const isDirty = useMemo(() => {
    return (
      JSON.stringify(editedPlan) !== JSON.stringify(normalizePlanForEdit(plan))
    );
  }, [editedPlan, plan]);

  const isLoading =
    updatePlanMutation.isPending ||
    approvePlanMutation.isPending ||
    saveAndApprovePlanMutation.isPending;

  function setTopLevel<K extends keyof ResearchPlan>(
    key: K,
    value: ResearchPlan[K],
  ) {
    setEditedPlan((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateStage(index: number, value: string) {
    setEditedPlan((prev) => {
      const stages = [...prev.stages];
      stages[index] = value;
      return { ...prev, stages };
    });
  }

  function addStage() {
    setEditedPlan((prev) => ({
      ...prev,
      stages: [...prev.stages, ""],
    }));
  }

  function removeStage(index: number) {
    setEditedPlan((prev) => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index),
    }));
  }

  function updateStarterSource(
    index: number,
    key: keyof StarterSource,
    value: string,
  ) {
    setEditedPlan((prev) => {
      const starter_sources = [...prev.starter_sources];
      starter_sources[index] = {
        ...starter_sources[index],
        [key]: value,
      };
      return { ...prev, starter_sources };
    });
  }

  function addStarterSource() {
    setEditedPlan((prev) => ({
      ...prev,
      starter_sources: [...prev.starter_sources, makeEmptyStarterSource()],
    }));
  }

  function removeStarterSource(index: number) {
    setEditedPlan((prev) => ({
      ...prev,
      starter_sources: prev.starter_sources.filter((_, i) => i !== index),
    }));
  }

  function updateTask(taskIndex: number, patch: Partial<ResearchTask>) {
    setEditedPlan((prev) => {
      const tasks = [...prev.tasks];
      tasks[taskIndex] = { ...tasks[taskIndex], ...patch };
      return { ...prev, tasks };
    });
  }

  function addTask() {
    setEditedPlan((prev) => ({
      ...prev,
      tasks: [...prev.tasks, makeEmptyTask()],
    }));
  }

  function removeTask(taskIndex: number) {
    setEditedPlan((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== taskIndex),
    }));
  }

  function buildPatch(
    _original: ResearchPlan,
    edited: ResearchPlan,
  ): Partial<ResearchPlan> {
    return {
      title: edited.title,
      objective: edited.objective,
      stages: edited.stages,
      tasks: edited.tasks,
      starter_sources: edited.starter_sources,
      context: edited.context,
      approver_notes: edited.approver_notes,
    };
  }

  async function handleSave() {
    const patch = buildPatch(plan, editedPlan);

    await updatePlanMutation.mutateAsync({
      id: plan.id,
      patch,
    });
  }

  async function handleApprove() {
    const patch = buildPatch(plan, editedPlan);

    if (isDirty) {
      await saveAndApprovePlanMutation.mutateAsync({
        id: plan.id,
        patch,
        notes: notes || editedPlan.approver_notes || undefined,
      });
    } else {
      await approvePlanMutation.mutateAsync({
        id: plan.id,
        notes: notes || editedPlan.approver_notes || undefined,
      });
    }

    socket.emit("plan_approved", {
      thread_id: threadId,
      interrupt_id: interruptId,
      plan: editedPlan,
      notes: notes || editedPlan.approver_notes || undefined,
    });

    onClose();
  }

  function handleReject() {
    socket.emit("plan_rejected", {
      thread_id: threadId,
      interrupt_id: interruptId,
      notes,
    });

    onClose();
  }

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <div>
        <h4 className="text-sm font-semibold">
          Review, edit, and approve plan
        </h4>
        <p className="text-xs text-muted-foreground">
          You can edit the plan before approval. Agent config is intentionally
          omitted.
        </p>
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Plan title</span>
        <input
          value={editedPlan.title}
          onChange={(e) => setTopLevel("title", e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Objective</span>
        <textarea
          value={editedPlan.objective}
          onChange={(e) => setTopLevel("objective", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Context</span>
        <textarea
          value={editedPlan.context}
          onChange={(e) => setTopLevel("context", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Stages</span>
          <button
            type="button"
            onClick={addStage}
            className="rounded border border-border px-2 py-1 text-xs"
          >
            Add stage
          </button>
        </div>

        {editedPlan.stages.map((stage, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={stage}
              onChange={(e) => updateStage(index, e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => removeStage(index)}
              className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Starter sources</span>
          <button
            type="button"
            onClick={addStarterSource}
            className="rounded border border-border px-2 py-1 text-xs"
          >
            Add source
          </button>
        </div>

        {editedPlan.starter_sources.map((source, index) => (
          <div
            key={index}
            className="space-y-2 rounded-lg border border-border p-3"
          >
            <input
              value={source.url}
              onChange={(e) =>
                updateStarterSource(index, "url", e.target.value)
              }
              placeholder="URL"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <textarea
              value={source.description}
              onChange={(e) =>
                updateStarterSource(index, "description", e.target.value)
              }
              placeholder="Description"
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => removeStarterSource(index)}
              className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
            >
              Remove source
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Tasks</span>
          <button
            type="button"
            onClick={addTask}
            className="rounded border border-border px-2 py-1 text-xs"
          >
            Add task
          </button>
        </div>

        {editedPlan.tasks.map((task, taskIndex) => (
          <div
            key={task.id}
            className="space-y-3 rounded-xl border border-border p-4"
          >
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium">Task {taskIndex + 1}</h5>
              <button
                type="button"
                onClick={() => removeTask(taskIndex)}
                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
              >
                Remove task
              </button>
            </div>

            <input
              value={task.title}
              onChange={(e) => updateTask(taskIndex, { title: e.target.value })}
              placeholder="Task title"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />

            <textarea
              value={task.description}
              onChange={(e) =>
                updateTask(taskIndex, { description: e.target.value })
              }
              placeholder="Task description"
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />

            <div className="grid gap-3 md:grid-cols-3">
              <input
                value={task.id}
                onChange={(e) => updateTask(taskIndex, { id: e.target.value })}
                placeholder="Task id"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={task.stage}
                onChange={(e) =>
                  updateTask(taskIndex, { stage: e.target.value })
                }
                placeholder="Stage"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={task.estimated_duration_minutes ?? ""}
                onChange={(e) =>
                  updateTask(taskIndex, {
                    estimated_duration_minutes:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
                placeholder="Estimated minutes"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">Dependencies</span>
              <input
                value={task.dependencies.join(", ")}
                onChange={(e) =>
                  updateTask(taskIndex, { dependencies: parseCsv(e.target.value) })
                }
                placeholder="task-a, task-b"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs text-muted-foreground">Selected tools</span>
                <input
                  value={task.selected_tool_names.join(", ")}
                  onChange={(e) =>
                    updateTask(taskIndex, {
                      selected_tool_names: parseCsv(e.target.value),
                    })
                  }
                  placeholder="search_web, extract_from_urls"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-muted-foreground">Selected subagents</span>
                <input
                  value={task.selected_subagent_names.join(", ")}
                  onChange={(e) =>
                    updateTask(taskIndex, {
                      selected_subagent_names: parseCsv(e.target.value),
                    })
                  }
                  placeholder="browser_control, tavily_research"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">Stage type</span>
              <select
                value={task.stage_type ?? ""}
                onChange={(e) =>
                  updateTask(taskIndex, {
                    stage_type: (e.target.value || null) as ResearchTask["stage_type"],
                  })
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">(infer later)</option>
                <option value="discovery">discovery</option>
                <option value="entity_validation">entity_validation</option>
                <option value="official_site_mapping">official_site_mapping</option>
                <option value="targeted_extraction">targeted_extraction</option>
                <option value="report_synthesis">report_synthesis</option>
              </select>
            </label>
          </div>
        ))}
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">
          Approval / revision notes
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Revision notes or rejection reason..."
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading || !isDirty}
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          {updatePlanMutation.isPending ? "Saving..." : "Save changes"}
        </button>

        <button
          type="button"
          onClick={handleApprove}
          disabled={isLoading}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saveAndApprovePlanMutation.isPending || approvePlanMutation.isPending
            ? "Approving..."
            : "Save + approve"}
        </button>

        <button
          type="button"
          onClick={handleReject}
          disabled={isLoading}
          className="rounded-lg border border-red-300 bg-background px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Reject
        </button>
      </div>

      {(updatePlanMutation.error ||
        approvePlanMutation.error ||
        saveAndApprovePlanMutation.error) && (
        <p className="text-sm text-red-600">
          Something went wrong while saving or approving the plan.
        </p>
      )}
    </div>
  );
}
