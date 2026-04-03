"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useThread, useMessages, useUpdateThread, useDeleteThread } from "@/lib/queries";
import { ChatView } from "@/components/chat/ChatView";
import { PlanReviewPanel } from "@/components/plan/PlanReviewPanel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ThreadPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: thread, isLoading: threadLoading, error: threadError } = useThread(id);
  const { data: messagesPage } = useMessages(id);
  const updateThread = useUpdateThread();
  const deleteThread = useDeleteThread();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  function startEditTitle() {
    if (!thread) return;
    setTitleValue(thread.title);
    setIsEditingTitle(true);
  }

  async function saveTitle() {
    const title = titleValue.trim();
    if (title && title !== thread?.title) {
      await updateThread.mutateAsync({ id, title });
    }
    setIsEditingTitle(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this thread and all its messages? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteThread.mutateAsync(id);
      router.push("/dashboard/chats");
    } finally {
      setIsDeleting(false);
    }
  }

  if (threadLoading) {
    return (
      <div className="p-6 space-y-4 animate-in fade-in duration-300">
        <div className="h-6 w-52 bg-muted rounded animate-pulse" />
        <div className="h-4 w-32 bg-muted/60 rounded animate-pulse" />
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
          ))}
        </div>
      </div>
    );
  }

  if (threadError || !thread) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
          Thread not found or failed to load.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-h-0 border-r border-border">
        {/* Thread header */}
        <header className="shrink-0 px-4 py-3 border-b border-border flex items-center gap-2 bg-background">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") setIsEditingTitle(false);
                }}
                className="w-full font-medium text-sm px-2 py-0.5 rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
            ) : (
              <button
                onClick={startEditTitle}
                className="group flex items-center gap-1.5 min-w-0 text-left"
                title="Click to rename"
              >
                <span className="font-medium text-sm truncate">{thread.title}</span>
                <svg
                  className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              Updated {new Date(thread.updated_at).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                thread.status === "active"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  thread.status === "active" ? "bg-green-500" : "bg-muted-foreground"
                }`}
              />
              {thread.status}
            </span>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
              title="Delete thread"
            >
              {isDeleting ? (
                <span className="inline-block w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </header>

        <ChatView threadId={id} initialMessages={messagesPage?.items} />
      </div>
      <PlanReviewPanel threadId={id} />
    </div>
  );
}
