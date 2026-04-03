"use client";

import Link from "next/link";

export default function RunsListPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-lg font-bold mb-2">Research Runs</h1>
      <p className="text-sm text-muted-foreground mb-6">
        This area is being redesigned. Mission execution and outputs live on the mission page for now.
      </p>
      <Link
        href="/dashboard/missions"
        className="text-sm font-medium text-primary hover:underline"
      >
        Go to missions
      </Link>
    </div>
  );
}
