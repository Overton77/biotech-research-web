import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";

export default function ThreadsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <WorkspaceHeader />
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
