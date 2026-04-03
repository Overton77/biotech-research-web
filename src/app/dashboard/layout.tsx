"use client";

import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { KgApolloProvider } from "@/providers/KgApolloProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <KgApolloProvider>
      <div className="flex h-full min-h-0 w-full">
        <DashboardNav />
        <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
      </div>
    </KgApolloProvider>
  );
}
