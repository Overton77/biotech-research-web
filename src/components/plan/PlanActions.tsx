"use client";

import { useEffect, useMemo, useState } from "react";
import { useSocket } from "@/providers/SocketProvider";
import {
  type ResearchPlan,
  type ResearchTask,
  type StarterSource,
  type TaskInputRef,
  type TaskOutputSpec,
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

function makeEmptyTaskInput(): TaskInputRef {
  return {
    name: "",
    source: "user_provided",
    description: "",
    source_task_id: undefined,
    output_name: undefined,
  };
}

function makeEmptyTaskOutput(): TaskOutputSpec {
  return {
    name: "",
    type: "text",
    description: "",
    required: true,
  };
}

function makeEmptyTask(): ResearchTask {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    stage: "",
    sub_stage: "",
    agent_config: {} as never, // intentionally ignored in UI
    inputs: [],
    outputs: [],
    dependencies: [],
    estimated_duration_minutes: undefined,
  };
}

function normalizePlanForEdit(plan: ResearchPlan): ResearchPlan {
  return {
    ...plan,
    approver_notes: plan.approver_notes ?? "",
    starter_sources: plan.starter_sources ?? [],
    stages: plan.stages ?? [],
    tasks: (plan.tasks ?? []).map((task) => ({
      ...task,
      sub_stage: task.sub_stage ?? "",
      inputs: task.inputs ?? [],
      outputs: task.outputs ?? [],
      dependencies: task.dependencies ?? [],
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

  function updateDependency(
    taskIndex: number,
    depIndex: number,
    value: string,
  ) {
    setEditedPlan((prev) => {
      const tasks = [...prev.tasks];
      const dependencies = [...tasks[taskIndex].dependencies];
      dependencies[depIndex] = value;
      tasks[taskIndex] = { ...tasks[taskIndex], dependencies };
      return { ...prev, tasks };
    });
  }

  function addDependency(taskIndex: number) {
    setEditedPlan((prev) => {
      const tasks = [...prev.tasks];
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        dependencies: [...tasks[taskIndex].dependencies, ""],
      };
      return { ...prev, tasks };
    });
  }

  function removeDependency(taskIndex: number, depIndex: number) {
    setEditedPlan((prev) => {
      const tasks = [...prev.tasks];
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        dependencies: tasks[taskIndex].dependencies.filter(
          (_, i) => i !== depIndex,
        ),
      };
      return { ...prev, tasks };
    });
  }

  function updateTaskInput(
    taskIndex: number,
    inputIndex: number,
    patch: Partial<TaskInputRef>,
  ) {
    setEditedPlan((prev) => {
      const tasks = [...prev.tasks];
      const inputs = [...tasks[taskIndex].inputs];
      inputs[inputIndex] = { ...inputs[inputIndex], ...patch };
      tasks[taskIndex] = { ...tasks[taskIndex], inputs };
      return { ...prev, tasks };
    });
  }

  function addTaskInput(taskIndex: number) {
    setEditedPlan((prev) => {
      const tasks = [...prev.tasks];
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        inputs: [...tasks[taskIndex].inputs, makeEmptyTaskInput()],
      };
      return { ...prev, tasks };
    });
  }

  function removeTaskInput(taskIndex: number, inputIndex: number) {
    setEditedPlan((prev) => {
      const tasks = [...prev.tasks];
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        inputs: tasks[taskIndex].inputs.filter((_, i) => i !== inputIndex),
      };
      return { ...prev, tasks };
    });
  }

  function updateTaskOutput(
    taskIndex: number,
    outputIndex: number,
    patch: Partial<TaskOutputSpec>,
  ) {
    setEditedPlan((prev) => {
      const tasks = [...prev.tasks];
      const outputs = [...tasks[taskIndex].outputs];
      outputs[outputIndex] = { ...outputs[outputIndex], ...patch };
      tasks[taskIndex] = { ...tasks[taskIndex], outputs };
      return { ...prev, tasks };
    });
  }

  function addTaskOutput(taskIndex: number) {
    setEditedPlan((prev) => {
      const tasks = [...prev.tasks];
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        outputs: [...tasks[taskIndex].outputs, makeEmptyTaskOutput()],
      };
      return { ...prev, tasks };
    });
  }

  function removeTaskOutput(taskIndex: number, outputIndex: number) {
    setEditedPlan((prev) => {
      const tasks = [...prev.tasks];
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        outputs: tasks[taskIndex].outputs.filter((_, i) => i !== outputIndex),
      };
      return { ...prev, tasks };
    });
  }

  function buildPatch(
    original: ResearchPlan,
    edited: ResearchPlan,
  ): Partial<ResearchPlan> {
    return {
      title: edited.title,
      objective: edited.objective,
      stages: edited.stages,
      tasks: edited.tasks,
      starter_sources: edited.starter_sources,
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
                value={task.stage}
                onChange={(e) =>
                  updateTask(taskIndex, { stage: e.target.value })
                }
                placeholder="Stage"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                value={task.sub_stage ?? ""}
                onChange={(e) =>
                  updateTask(taskIndex, { sub_stage: e.target.value })
                }
                placeholder="Sub-stage"
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Dependencies
                </span>
                <button
                  type="button"
                  onClick={() => addDependency(taskIndex)}
                  className="rounded border border-border px-2 py-1 text-xs"
                >
                  Add dependency
                </button>
              </div>

              {task.dependencies.map((dep, depIndex) => (
                <div key={depIndex} className="flex gap-2">
                  <input
                    value={dep}
                    onChange={(e) =>
                      updateDependency(taskIndex, depIndex, e.target.value)
                    }
                    placeholder="Task id dependency"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeDependency(taskIndex, depIndex)}
                    className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Inputs</span>
                <button
                  type="button"
                  onClick={() => addTaskInput(taskIndex)}
                  className="rounded border border-border px-2 py-1 text-xs"
                >
                  Add input
                </button>
              </div>

              {task.inputs.map((input, inputIndex) => (
                <div
                  key={inputIndex}
                  className="space-y-2 rounded-lg border border-border p-3"
                >
                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      value={input.name}
                      onChange={(e) =>
                        updateTaskInput(taskIndex, inputIndex, {
                          name: e.target.value,
                        })
                      }
                      placeholder="Input name"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <select
                      value={input.source}
                      onChange={(e) =>
                        updateTaskInput(taskIndex, inputIndex, {
                          source: e.target.value as TaskInputRef["source"],
                        })
                      }
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="user_provided">user_provided</option>
                      <option value="task_output">task_output</option>
                      <option value="external">external</option>
                    </select>
                  </div>

                  <textarea
                    value={input.description}
                    onChange={(e) =>
                      updateTaskInput(taskIndex, inputIndex, {
                        description: e.target.value,
                      })
                    }
                    placeholder="Input description"
                    rows={2}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />

                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      value={input.source_task_id ?? ""}
                      onChange={(e) =>
                        updateTaskInput(taskIndex, inputIndex, {
                          source_task_id: e.target.value || undefined,
                        })
                      }
                      placeholder="Source task id"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={input.output_name ?? ""}
                      onChange={(e) =>
                        updateTaskInput(taskIndex, inputIndex, {
                          output_name: e.target.value || undefined,
                        })
                      }
                      placeholder="Output name"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTaskInput(taskIndex, inputIndex)}
                    className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                  >
                    Remove input
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Outputs</span>
                <button
                  type="button"
                  onClick={() => addTaskOutput(taskIndex)}
                  className="rounded border border-border px-2 py-1 text-xs"
                >
                  Add output
                </button>
              </div>

              {task.outputs.map((output, outputIndex) => (
                <div
                  key={outputIndex}
                  className="space-y-2 rounded-lg border border-border p-3"
                >
                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      value={output.name}
                      onChange={(e) =>
                        updateTaskOutput(taskIndex, outputIndex, {
                          name: e.target.value,
                        })
                      }
                      placeholder="Output name"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <select
                      value={output.type}
                      onChange={(e) =>
                        updateTaskOutput(taskIndex, outputIndex, {
                          type: e.target.value as TaskOutputSpec["type"],
                        })
                      }
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="text">text</option>
                      <option value="markdown">markdown</option>
                      <option value="json">json</option>
                      <option value="file">file</option>
                      <option value="s3_ref">s3_ref</option>
                    </select>
                  </div>

                  <textarea
                    value={output.description}
                    onChange={(e) =>
                      updateTaskOutput(taskIndex, outputIndex, {
                        description: e.target.value,
                      })
                    }
                    placeholder="Output description"
                    rows={2}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={output.required}
                      onChange={(e) =>
                        updateTaskOutput(taskIndex, outputIndex, {
                          required: e.target.checked,
                        })
                      }
                    />
                    Required
                  </label>

                  <button
                    type="button"
                    onClick={() => removeTaskOutput(taskIndex, outputIndex)}
                    className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                  >
                    Remove output
                  </button>
                </div>
              ))}
            </div>
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
