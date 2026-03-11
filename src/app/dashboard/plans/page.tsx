"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlans, useLaunchPlan } from "@/lib/queries";
import { Pagination } from "@/components/dashboard/Pagination";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

const PAGE_SIZE = 20;

export default function PlansListPage() {
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const { data, isLoading } = usePlans({ skip, limit: PAGE_SIZE });
  const launchPlan = useLaunchPlan();

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

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/60 animate-pulse" />
          ))}
        </div>
      )}

      {data && data.items.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">No plans found.</p>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Objective</th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Created</th>
                  <th className="text-right px-4 py-2.5 font-medium text-xs text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium truncate max-w-[200px]">{p.title}</td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[250px]">{p.objective}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
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
          <Pagination skip={skip} limit={PAGE_SIZE} total={data.total} onPageChange={setSkip} />
        </>
      )}
    </div>
  );
}
