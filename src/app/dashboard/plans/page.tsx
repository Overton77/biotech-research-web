"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlans, useLaunchPlan } from "@/lib/queries";
import { Pagination } from "@/components/dashboard/Pagination";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { api } from "@/lib/api";
import {
  type ResearchPlan,
  ResearchTask,
  TaskOutputSpec,
  TaskInputRef,
  StarterSource,
} from "@/types/api";

const PAGE_SIZE = 20;

export default function PlansListPage() {
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const { data, isLoading } = usePlans({ skip, limit: PAGE_SIZE });
  const [planEdit, setPlanEdit] = useState<ResearchPlan | null>(null);
  const [editMode, setEditMode] = useState<"view" | "edit">("view");
  const launchPlan = useLaunchPlan();

  const editPlan = async (planId: string, patch: Partial<ResearchPlan>) => {
    try {
      const result = await api.plans.update(planId, patch);
      return result;
    } catch (e) {
      console.error("Edit failed:", e);
    }
  };

  async function handleLaunch(planId: string) {
    try {
      const result = await launchPlan.mutateAsync(planId);
      router.push(`/runs/${result.mission_id}`);
    } catch (e) {
      console.error("Launch failed:", e);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-lg font-bold mb-4">Research Plans</h1>

      <h4 className="text-sm font-bold mb-4">
        Click Edit Plan to change views and edit
      </h4>

      <div className="border border-border rounded-lg overflow-hidden w-fit">
        <button
          className="px-2.5 py-1 text-xs rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          onClick={() => setEditMode("edit")}
        >
          Edit Mode
        </button>
      </div>

      <h4 className="text-sm font-bold mb-4">
        Click View Mode to see view mode{" "}
      </h4>

      <div className="cursor-pointer border border-border rounded-lg overflow-hidden w-fit">
        <button
          className="cursor-pointer px-2.5 py-1 text-xs rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          onClick={() => setEditMode("view")}
        >
          View Mode
        </button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg bg-muted/60 animate-pulse"
            />
          ))}
        </div>
      )}

      {data && data.items.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No plans found.
        </p>
      )}

      {data && data.items.length > 0 && editMode === "view" && (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">
                    Title
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">
                    Objective
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">
                    Created
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-xs text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium truncate max-w-[200px]">
                      {p.title}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[250px]">
                      {p.objective}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/threads/${p.thread_id}`}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          View
                        </Link>
                        {p.status === "approved" && (
                          <button
                            onClick={() => handleLaunch(p.id)}
                            disabled={launchPlan.isPending}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                          >
                            Launch
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            skip={skip}
            limit={PAGE_SIZE}
            total={data.total}
            onPageChange={setSkip}
          />
        </>
      )}

      {data && data.items.length > 0 && editMode === "edit" && (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">
                    Title
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">
                    Objective
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">
                    Created
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-xs text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((p) => (
                  <tr key={p.id}>
                    <th className="px-4 py-2 align-middle">
                      <input
                        type="text"
                        className="w-full bg-background border border-input rounded px-2 py-1 text-sm"
                        value={p.title}
                        onChange={(e) =>
                          setPlanEdit({ ...p, title: e.target.value })
                        }
                      />
                    </th>
                    <th className="px-4 py-2 align-middle">
                      <input
                        type="text"
                        className="w-full bg-background border border-input rounded px-2 py-1 text-sm"
                        value={p.objective}
                        onChange={(e) =>
                          setPlanEdit({ ...p, objective: e.target.value })
                        }
                      />
                    </th>
                    <th className="px-4 py-2 align-middle">
                      <input
                        type="text"
                        className="w-full bg-background border border-input rounded px-2 py-1 text-sm"
                        value={p.status}
                        onChange={(e) =>
                          setPlanEdit({
                            ...p,
                            status: e.target.value as
                              | "draft"
                              | "pending_approval"
                              | "approved"
                              | "rejected"
                              | "executing"
                              | "complete"
                              | "failed",
                          })
                        }
                      />
                    </th>
                    <th className="px-4 py-2 align-middle">
                      <input
                        type="text"
                        className="w-full bg-background border border-input rounded px-2 py-1 text-sm"
                        value={p.created_at}
                        onChange={(e) =>
                          setPlanEdit({ ...p, created_at: e.target.value })
                        }
                      />
                    </th>
                    <th className="px-4 py-2 align-middle">
                      <input
                        type="text"
                        className="w-full bg-background border border-input rounded px-2 py-1 text-sm"
                        value={p.updated_at}
                        onChange={(e) =>
                          setPlanEdit({ ...p, updated_at: e.target.value })
                        }
                      />
                    </th>
                    <th className="px-4 py-2 align-middle">
                      <input
                        type="text"
                        className="w-full bg-background border border-input rounded px-2 py-1 text-sm"
                        value={p.approved_at ?? ""}
                        onChange={(e) =>
                          setPlanEdit({ ...p, approved_at: e.target.value })
                        }
                      />
                    </th>
                    <th className="px-4 py-2 align-middle">
                      <input
                        type="text"
                        className="w-full bg-background border border-input rounded px-2 py-1 text-sm"
                        value={p.approver_notes ?? ""}
                        onChange={(e) =>
                          setPlanEdit({ ...p, approver_notes: e.target.value })
                        }
                      />
                    </th>
                    <th className="px-4 py-2 align-middle">
                      <input
                        type="number"
                        className="w-full bg-background border border-input rounded px-2 py-1 text-sm"
                        value={p.version}
                        onChange={(e) =>
                          setPlanEdit({
                            ...p,
                            version: parseInt(e.target.value),
                          })
                        }
                      />
                    </th>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
