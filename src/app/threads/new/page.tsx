"use client";

import { useRouter } from "next/navigation";
import { useCreateThread } from "@/lib/queries";
import { useState } from "react";

export default function NewThreadPage() {
  const router = useRouter();
  const createThread = useCreateThread();
  const [title, setTitle] = useState("New research");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const thread = await createThread.mutateAsync(title);
      router.push(`/threads/${thread.id}`);
    } catch {
      // error shown below
    }
  }

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-xl font-semibold mb-4">New research thread</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </label>
        {createThread.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {createThread.error instanceof Error ? createThread.error.message : "Failed to create thread"}
          </p>
        )}
        <button
          type="submit"
          disabled={createThread.isPending}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {createThread.isPending ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
