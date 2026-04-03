"use client";

import { useQuery } from "@apollo/client";
import Link from "next/link";
import {
  Building2,
  FlaskConical,
  LayoutGrid,
  Microscope,
  Package,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  DashboardOverviewEntityTotalsDocument,
  type DashboardOverviewEntityTotalsQuery,
} from "@/gql/graphql";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ENTITY_LINK = "/dashboard/entities";

type TotalsData = DashboardOverviewEntityTotalsQuery;

const COVERAGE_ITEMS: readonly {
  label: string;
  Icon: LucideIcon;
  select: (d: TotalsData) => number;
}[] = [
  {
    label: "Products",
    Icon: Package,
    select: (d) => d.productsConnection.totalCount,
  },
  {
    label: "Organizations",
    Icon: Building2,
    select: (d) => d.organizationsConnection.totalCount,
  },
  {
    label: "Lab tests",
    Icon: FlaskConical,
    select: (d) => d.labTestsConnection.totalCount,
  },
  {
    label: "Panel definitions",
    Icon: LayoutGrid,
    select: (d) => d.panelDefinitionsConnection.totalCount,
  },
  {
    label: "People",
    Icon: Users,
    select: (d) => d.peopleConnection.totalCount,
  },
  {
    label: "Studies",
    Icon: Microscope,
    select: (d) => d.studiesConnection.totalCount,
  },
];

export function KnowledgeGraphTotalsSection() {
  const { data, loading, error } = useQuery(DashboardOverviewEntityTotalsDocument, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Knowledge graph coverage</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Entity counts from Neo4j GraphQL (unfiltered). Open Entities to browse and search.
          </p>
        </div>
        <Link
          href={ENTITY_LINK}
          className="text-xs font-medium text-primary hover:underline shrink-0"
        >
          Browse entities →
        </Link>
      </div>

      {error && (
        <p className="text-xs text-destructive rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          Could not load graph totals. Check{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[10px]">NEXT_PUBLIC_NEO4J_GRAPHQL_URL</code>{" "}
          and that biotech-kg is running.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {COVERAGE_ITEMS.map(({ label, Icon, select }) => {
          const value =
            data != null ? select(data) : loading ? null : null;
          const showPulse = loading && data == null;

          return (
            <Link key={label} href={ENTITY_LINK} className="group block h-full min-h-0">
              <Card
                className={cn(
                  "h-full gap-0 py-4 shadow-sm transition-colors",
                  "hover:border-primary/25 hover:bg-muted/20",
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pb-2 pt-0">
                  <CardTitle className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </CardTitle>
                  <span
                    className="flex size-8 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
                    aria-hidden
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                </CardHeader>
                <CardContent className="px-4 pb-0 pt-0">
                  <p
                    className={cn(
                      "text-2xl font-semibold tabular-nums tracking-tight",
                      showPulse && "animate-pulse rounded bg-muted h-8 w-16",
                    )}
                  >
                    {!showPulse && (value != null ? value.toLocaleString() : "—")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
