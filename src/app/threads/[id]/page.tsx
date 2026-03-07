import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { ChatView } from "@/components/chat/ChatView";
import { PlanReviewPanel } from "@/components/plan/PlanReviewPanel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ThreadPage({ params }: PageProps) {
  const { id } = await params;
  let thread;
  let messages;
  try {
    thread = await api.threads.get(id);
    const page = await api.threads.messages(id);
    messages = page.items;
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-col h-full lg:flex-row">
      <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 dark:border-gray-800">
        <header className="p-3 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-medium">{thread.title}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Thread · {new Date(thread.updated_at).toLocaleString()}
          </p>
        </header>
        <ChatView threadId={id} initialMessages={messages} />
      </div>
      <PlanReviewPanel threadId={id} />
    </div>
  );
}
