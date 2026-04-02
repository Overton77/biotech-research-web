"use client";

import { useState } from "react";
import Link from "next/link";
import { useRuns } from "@/lib/queries";
import { Pagination } from "@/components/dashboard/Pagination";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

const PAGE_SIZE = 20;

export default function RunsListPage() {
  const [skip, setSkip] = useState(0);
  const { data, isLoading } = useRuns({ skip, limit: PAGE_SIZE });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-lg font-bold mb-4">Research Runs</h1>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/60 animate-pulse" />
          ))}
        </div>
      )}

      {data && data.items.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">No runs found.</p>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Task</th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Mission</th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Iteration</th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Started</th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Completed</th>
                  <th className="text-right px-4 py-2.5 font-medium text-xs text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs truncate max-w-[150px]">{r.task_slug}</td>
                    <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]">
                      <Link
                        href={`/runs/${r.mission_id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {r.mission_id.slice(-8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs">{r.iteration ?? 1}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {r.started_at ? new Date(r.started_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {r.completed_at ? new Date(r.completed_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/runs/${r.mission_id}`}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        View mission
                      </Link>
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
