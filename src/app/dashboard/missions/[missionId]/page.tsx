"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMission } from "@/lib/queries";
import { MissionOverview } from "@/components/missions/MissionOverview";
import { MissionLivePanel } from "@/components/missions/MissionLivePanel";
import { MissionOutputsView } from "@/components/run/MissionOutputsView";
import { cn } from "@/lib/utils";

type Tab = "overview" | "live" | "outputs";

export default function MissionDetailPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = use(params);
  const { data: mission, isLoading, error } = useMission(missionId);
  const [tab, setTab] = useState<Tab>("overview");

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">
          Mission not found or failed to load.
        </p>
        <Link
          href="/dashboard/missions"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          Back to missions
        </Link>
      </div>
    );
  }

  if (isLoading || !mission) {
    return (
      <div className="p-6 space-y-4 max-w-4xl">
        <div className="h-8 w-2/3 max-w-md animate-pulse rounded-md bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted/60" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "live", label: "Live" },
    { id: "outputs", label: "Outputs" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto pb-16">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/dashboard/missions" className="hover:text-foreground">
          Missions
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{mission.title}</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{mission.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {mission.objective}
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-border pb-px">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <MissionOverview mission={mission} showDag={false} />
      )}
      {tab === "live" && (
        <div className="h-[min(70vh,560px)]">
          <MissionLivePanel missionId={missionId} />
        </div>
      )}
      {tab === "outputs" && <MissionOutputsView missionId={missionId} />}
    </div>
  );
}
