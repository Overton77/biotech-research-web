"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlans, useLaunchPlan } from "@/lib/queries";
import { Pagination } from "@/components/dashboard/Pagination";
import {
  ResearchPlanCard,
  ResearchPlanCardGrid,
} from "@/components/plans/ResearchPlanCard";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

export default function PlansListPage() {
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const { data, isLoading } = usePlans({ skip, limit: PAGE_SIZE });
  const launchPlan = useLaunchPlan();

  async function handleLaunch(planId: string) {
    try {
      const result = await launchPlan.mutateAsync(planId);
      router.push(`/dashboard/missions/${result.mission_id}`);
    } catch (e) {
      console.error("Launch failed:", e);
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Research plans
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Browse objectives, pipeline flags, and task structure. Open a plan for
          the full layout, edits, and launch.
        </p>
      </div>

      {isLoading && (
        <ResearchPlanCardGrid>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))}
        </ResearchPlanCardGrid>
      )}

      {data && data.items.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No plans found.
        </p>
      )}

      {data && data.items.length > 0 && (
        <>
          <ResearchPlanCardGrid>
            {data.items.map((p) => (
              <ResearchPlanCard
                key={p.id}
                plan={p}
                onOpen={() => router.push(`/dashboard/plans/${p.id}`)}
              >
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/threads/${p.thread_id}`}>Thread</Link>
                </Button>
                {p.mission_id && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/missions/${p.mission_id}`}>Mission</Link>
                  </Button>
                )}
                {p.status === "approved" && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={launchPlan.isPending}
                    onClick={() => handleLaunch(p.id)}
                  >
                    Launch
                  </Button>
                )}
              </ResearchPlanCard>
            ))}
          </ResearchPlanCardGrid>
          <div className="mt-10">
            <Pagination
              skip={skip}
              limit={PAGE_SIZE}
              total={data.total}
              onPageChange={setSkip}
            />
          </div>
        </>
      )}
    </div>
  );
}
