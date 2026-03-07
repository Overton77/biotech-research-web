import Link from "next/link";
import { api } from "@/lib/api";
import type { Thread } from "@/types/api";

export default async function Home() {
  let threads: Thread[] = [];
  let error: string | null = null;
  try {
    const page = await api.threads.list();
    threads = page.items;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load threads";
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Research Threads</h1>
        <Link
          href="/threads/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          New research
        </Link>
      </div>
      {error && (
        <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </p>
      )}
      {threads.length === 0 && !error && (
        <p className="text-gray-500 dark:text-gray-400">No threads yet. Create one to get started.</p>
      )}
      <ul className="space-y-2">
        {threads.map((t) => (
          <li key={t.id}>
            <Link
              href={`/threads/${t.id}`}
              className="block rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
            >
              <span className="font-medium">{t.title}</span>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                {new Date(t.updated_at).toLocaleDateString()}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
