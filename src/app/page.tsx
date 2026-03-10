"use client";

import { useRouter } from "next/navigation";
import { useCreateThread } from "@/lib/queries";

export default function Home() {
  const router = useRouter();
  const createThread = useCreateThread();

  async function handleNewThread() {
    try {
      const thread = await createThread.mutateAsync("New research");
      router.push(`/threads/${thread.id}`);
    } catch {
      /* error surfaced via createThread.error */
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Biotech Research Agent
          </h2>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
            Start a new research thread to collaborate with the AI Coordinator.
            Build research plans, run analyses, and explore biotech insights.
          </p>
        </div>

        {createThread.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
            {createThread.error instanceof Error
              ? createThread.error.message
              : "Failed to create thread"}
          </div>
        )}

        <button
          onClick={handleNewThread}
          disabled={createThread.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {createThread.isPending ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
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

        <p className="text-xs text-muted-foreground">
          Or select an existing thread from the sidebar
        </p>
      </div>
    </div>
  );
}
