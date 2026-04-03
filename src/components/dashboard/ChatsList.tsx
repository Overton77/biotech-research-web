"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  useThreads,
  useCreateThread,
  useUpdateThread,
  useDeleteThread,
} from "@/lib/queries";
import type { Thread } from "@/types/api";

function Spinner({ className = "size-3" }: { className?: string }) {
  return (
    <span
      className={`inline-block rounded-full border-2 border-current/30 border-t-current animate-spin ${className}`}
    />
  );
}

export function ChatsList() {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading } = useThreads();
  const createThread = useCreateThread();
  const updateThread = useUpdateThread();
  const deleteThread = useDeleteThread();

  const threads = data?.items ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  async function handleNewThread() {
    try {
      const thread = await createThread.mutateAsync("New research");
      router.push(`/threads/${thread.id}`);
    } catch {
      /* surfaced via createThread.error */
    }
  }

  function startEdit(e: React.MouseEvent, thread: Thread) {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(thread.id);
    setEditValue(thread.title);
  }

  async function saveEdit(id: string) {
    const title = editValue.trim();
    if (title) {
      await updateThread.mutateAsync({ id, title });
    }
    setEditingId(null);
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteThread.mutateAsync(id);
      if (pathname === `/threads/${id}`) {
        router.push("/dashboard/chats");
      }
    } finally {
      setDeletingId(null);
    }
  }

  const isActive = (id: string) => pathname === `/threads/${id}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold">Chats</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Coordinator threads — plans and research kickoff live here.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNewThread}
          disabled={createThread.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {createThread.isPending ? (
            <>
              <Spinner className="size-3.5 border-background/30 border-t-background" />
              Creating…
            </>
          ) : (
            <>
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New thread
            </>
          )}
        </button>
      </div>

      {createThread.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {createThread.error instanceof Error
            ? createThread.error.message
            : "Failed to create thread"}
        </div>
      )}

      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-4 py-3 border-b border-border bg-muted/20">
          All threads
        </p>

        {isLoading && (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-muted/60 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        )}

        {!isLoading && threads.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12 px-4">No threads yet. Start one above.</p>
        )}

        {!isLoading && threads.length > 0 && (
          <ul className="divide-y divide-border">
            {threads.map((t) => (
              <li key={t.id} className="group relative">
                {editingId === t.id ? (
                  <div className="px-4 py-3">
                    <input
                      ref={editRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(t.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(t.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                  </div>
                ) : (
                  <div
                    className={`flex items-center gap-2 px-4 py-3 pr-24 transition-colors ${
                      isActive(t.id) ? "bg-muted/50" : "hover:bg-muted/30"
                    }`}
                  >
                    <Link
                      href={`/threads/${t.id}`}
                      className="flex min-w-0 flex-1 items-center gap-2.5"
                    >
                      <svg
                        className={`size-4 shrink-0 ${isActive(t.id) ? "text-foreground/80" : "text-muted-foreground"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {new Date(t.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  </div>
                )}

                {editingId !== t.id && (
                  <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => startEdit(e, t)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                      title="Rename"
                    >
                      <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, t.id)}
                      disabled={deletingId === t.id}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 disabled:opacity-50"
                      title="Delete thread"
                    >
                      {deletingId === t.id ? <Spinner /> : (
                        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
