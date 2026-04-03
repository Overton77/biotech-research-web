"use client";

import { EntitiesExplorer } from "@/components/entities/EntitiesExplorer";

export default function DashboardEntitiesPage() {
  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-[420px] flex-col">
      <EntitiesExplorer />
    </div>
  );
}
