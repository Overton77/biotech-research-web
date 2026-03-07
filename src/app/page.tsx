"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useThreads, useCreateThread } from "@/lib/queries";

export default function Home() {
  const router = useRouter();
  const { data, isLoading, error } = useThreads();
  const createThread = useCreateThread();

  const threads = data?.items ?? [];

  async function handleNewThread() {
    try {
      const thread = await createThread.mutateAsync("New research");
      router.push(`/threads/${thread.id}`);
    } catch {
      // error is available via createThread.error
    }
  }

  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 p-6 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Research Threads</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Start a conversation with the Coordinator agent
            </p>
          </div>
          <button
            onClick={handleNewThread}
            disabled={createThread.isPending}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {createThread.isPending ? "Creating..." : "+ New thread"}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
            {error instanceof Error ? error.message : "Failed to load threads"}
          </div>
        )}
        {createThread.error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
            {createThread.error instanceof Error ? createThread.error.message : "Failed to create thread"}
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && threads.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3 opacity-30">&#x1F9EC;</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No threads yet. Create one to start researching.
            </p>
          </div>
        )}

        <ul className="space-y-2">
          {threads.map((t) => (
            <li key={t.id}>
              <Link
                href={`/threads/${t.id}`}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/60"
              >
                <div>
                  <span className="font-medium text-sm">{t.title}</span>
                  <span className="ml-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {t.status}
                  </span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(t.updated_at).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
