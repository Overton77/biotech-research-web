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

function Spinner({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <span
      className={`inline-block border-2 border-current/30 border-t-current rounded-full animate-spin ${className}`}
    />
  );
}

export function Sidebar() {
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
      /* error surfaced via createThread.error */
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
      if (pathname === `/threads/${id}`) router.push("/");
    } finally {
      setDeletingId(null);
    }
  }

  const isActive = (id: string) => pathname === `/threads/${id}`;

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-muted/20 flex flex-col">
      {/* Brand header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-background"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">
              Biotech Research
            </p>
            <p className="text-xs text-muted-foreground">AI Research Agent</p>
          </div>
        </div>
        <button
          onClick={handleNewThread}
          disabled={createThread.isPending}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
        >
          {createThread.isPending ? (
            <>
              <Spinner /> Creating…
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Thread
            </>
          )}
        </button>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 px-1">
            Threads
          </p>

          {isLoading && (
            <div className="space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 rounded-md bg-muted/60 animate-pulse"
                  style={{ opacity: 1 - i * 0.15 }}
                />
              ))}
            </div>
          )}

          {!isLoading && threads.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              No threads yet
            </p>
          )}

          {!isLoading && threads.length > 0 && (
            <div className="space-y-0.5">
              {threads.map((t) => (
                <div
                  key={t.id}
                  className={`group relative flex items-center rounded-md transition-colors ${
                    isActive(t.id)
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {editingId === t.id ? (
                    <input
                      ref={editRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(t.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(t.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="flex-1 mx-1 my-1 px-2 py-1 text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground/30"
                    />
                  ) : (
                    <Link
                      href={`/threads/${t.id}`}
                      className="flex-1 flex items-center gap-1.5 px-2 py-2 min-w-0 pr-14"
                    >
                      <svg
                        className={`w-3 h-3 shrink-0 ${isActive(t.id) ? "text-foreground/70" : "text-muted-foreground"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span className="text-xs truncate">{t.title}</span>
                    </Link>
                  )}

                  {editingId !== t.id && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                      <button
                        onClick={(e) => startEdit(e, t)}
                        className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                        title="Rename"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, t.id)}
                        disabled={deletingId === t.id}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete thread"
                      >
                        {deletingId === t.id ? (
                          <Spinner />
                        ) : (
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
