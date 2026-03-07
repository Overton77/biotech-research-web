"use client";

import { use } from "react";
import { useThread, useMessages } from "@/lib/queries";
import { ChatView } from "@/components/chat/ChatView";
import { PlanReviewPanel } from "@/components/plan/PlanReviewPanel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ThreadPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: thread, isLoading: threadLoading, error: threadError } = useThread(id);
  const { data: messagesPage } = useMessages(id);

  if (threadLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
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
        <header className="shrink-0 p-3 border-b border-border">
          <h2 className="font-medium text-sm">{thread.title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Thread &middot; {new Date(thread.updated_at).toLocaleString()}
          </p>
        </header>
        <ChatView threadId={id} initialMessages={messagesPage?.items} />
      </div>
      <PlanReviewPanel threadId={id} />
    </div>
  );
}
