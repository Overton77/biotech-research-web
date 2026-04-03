"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { usePlan, useLaunchPlan } from "@/lib/queries";
import { PlanActions } from "@/components/plan/PlanActions";
import {
  PlanSection,
  PlanSourceRow,
  PlanTaskAccordionItem,
  ResearchPlanDetailShell,
} from "@/components/plans/ResearchPlanDetail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: plan, isLoading, isError } = usePlan(id);
  const launchPlan = useLaunchPlan();
  const [editing, setEditing] = useState(false);

  async function handleLaunch() {
    if (!plan) return;
    try {
      const result = await launchPlan.mutateAsync(plan.id);
      router.push(`/dashboard/missions/${result.mission_id}`);
    } catch (e) {
      console.error("Launch failed:", e);
    }
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Plan not found or failed to load.
      </div>
    );
  }

  if (isLoading || !plan) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-8">
        <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted/60" />
        <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
      </div>
    );
  }

  const editable =
    plan.status === "draft" || plan.status === "pending_approval";
  const canLaunch = plan.status === "approved";

  const sidebar = (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Plan metadata</CardTitle>
        <CardDescription>Ids, pipeline, and links</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Plan ID
          </p>
          <p className="mt-0.5 break-all font-mono text-xs">{plan.id}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Version
          </p>
          <p className="mt-0.5">v{plan.version}</p>
        </div>
        {plan.mission_status && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Mission status
            </p>
            <p className="mt-0.5">{plan.mission_status}</p>
          </div>
        )}
        {plan.workflow_id && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Workflow
            </p>
            <p className="mt-0.5 break-all font-mono text-xs">{plan.workflow_id}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {plan.run_kg && <Badge variant="secondary">KG pipeline</Badge>}
          {plan.unstructured_ingestion?.enabled && (
            <Badge variant="secondary">Unstructured ingestion</Badge>
          )}
          {plan.unstructured_ingestion && (
            <Badge variant="outline" className="text-xs font-normal">
              Parser: {plan.unstructured_ingestion.parser_backend ?? "—"}
            </Badge>
          )}
        </div>
        {plan.approver_notes && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Approver notes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
              {plan.approver_notes}
            </p>
          </div>
        )}
        {plan.approved_at && (
          <p className="text-xs text-muted-foreground">
            Approved {new Date(plan.approved_at).toLocaleString()}
          </p>
        )}
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/threads/${plan.thread_id}`}>Open thread</Link>
          </Button>
          {plan.mission_id && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/missions/${plan.mission_id}`}>Open mission</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ResearchPlanDetailShell
      backHref="/dashboard/plans"
      plan={plan}
      sidebar={sidebar}
      headerActions={
        <>
          {editable && (
            <Button
              type="button"
              variant={editing ? "secondary" : "outline"}
              size="sm"
              onClick={() => setEditing((e) => !e)}
            >
              {editing ? "Close editor" : "Edit"}
            </Button>
          )}
          {canLaunch && (
            <Button
              type="button"
              size="sm"
              disabled={launchPlan.isPending}
              onClick={handleLaunch}
            >
              Launch mission
            </Button>
          )}
        </>
      }
    >
      {editing && editable && (
        <Card className="mb-10 border-border">
          <CardContent className="pt-6">
            <PlanActions
              threadId={plan.thread_id}
              interruptId={null}
              plan={plan}
              standalone
              onClose={() => setEditing(false)}
            />
          </CardContent>
        </Card>
      )}

      <PlanSection
        title="Context"
        description="Background the coordinator used when shaping this plan."
      >
        <Card className="border-border">
          <CardContent className="pt-6">
            <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
              {plan.context?.trim() || "No additional context stored."}
            </p>
          </CardContent>
        </Card>
      </PlanSection>

      <PlanSection
        title="Stages"
        description="Ordered research phases referenced by tasks."
      >
        <div className="flex flex-wrap gap-2">
          {(plan.stages ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No stages listed.</p>
          )}
          {(plan.stages ?? []).map((s) => (
            <Badge key={s} variant="outline" className="text-sm font-normal">
              {s}
            </Badge>
          ))}
        </div>
      </PlanSection>

      <PlanSection
        title="Tasks"
        description="Expand each task for tools, subagents, and dependencies."
      >
        {(plan.tasks ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks in this plan.</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {(plan.tasks ?? []).map((task) => (
              <PlanTaskAccordionItem key={task.id} task={task} />
            ))}
          </Accordion>
        )}
      </PlanSection>

      <PlanSection
        title="Starter sources"
        description="Seed URLs and notes for the mission compiler."
      >
        {(plan.starter_sources ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No starter sources.</p>
        ) : (
          (plan.starter_sources ?? []).map((s, i) => (
            <PlanSourceRow key={`${s.url}-${i}`} source={s} />
          ))
        )}
      </PlanSection>
    </ResearchPlanDetailShell>
  );
}
