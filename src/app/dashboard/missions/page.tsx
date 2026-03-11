"use client";

import { useState } from "react";
import Link from "next/link";
import { useMissions } from "@/lib/queries";
import { Pagination } from "@/components/dashboard/Pagination";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

const PAGE_SIZE = 20;

export default function MissionsListPage() {
  const [skip, setSkip] = useState(0);
  const { data, isLoading } = useMissions({ skip, limit: PAGE_SIZE });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-lg font-bold mb-4">Research Missions</h1>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/60 animate-pulse" />
          ))}
        </div>
      )}

      {data && data.items.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">No missions found.</p>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Goal</th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Tasks</th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground">Created</th>
                  <th className="text-right px-4 py-2.5 font-medium text-xs text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium truncate max-w-[180px]">{m.title}</td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[220px]">{m.goal}</td>
                    <td className="px-4 py-3 text-xs">{m.task_defs.length}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/runs/${m.id}`}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {m.status === "running" ? "Watch" : "View run"}
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
