"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import type { PaginationMode } from "./EntityPaginationControls";
import {
  KgLabTestPanel,
  KgOrganizationPanel,
  KgPanelDefinitionPanel,
  KgPersonPanel,
  KgProductPanel,
  KgStudyPanel,
} from "./kg-panels";

const ENTITY_KINDS = [
  { id: "organization" as const, label: "Organizations" },
  { id: "product" as const, label: "Products" },
  { id: "labTest" as const, label: "Lab tests" },
  { id: "panelDefinition" as const, label: "Panels" },
  { id: "person" as const, label: "People" },
  { id: "study" as const, label: "Studies" },
];

export function EntitiesExplorer() {
  const [kind, setKind] = useState<(typeof ENTITY_KINDS)[number]["id"]>(
    "organization",
  );
  const [search, setSearch] = useState("");
  const [paginationMode, setPaginationMode] =
    useState<PaginationMode>("cursor");
  const [pageSize, setPageSize] = useState(20);

  const panelProps = {
    search,
    paginationMode,
    pageSize,
    onPageSizeChange: setPageSize,
    onPaginationModeChange: setPaginationMode,
  };

  return (
    <div className="flex h-full min-h-0 max-h-full flex-col">
      <header className="shrink-0 border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">Knowledge graph</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse Neo4j GraphQL entities (biotech-kg). Set{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            NEXT_PUBLIC_NEO4J_GRAPHQL_URL
          </code>{" "}
          if not using{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            http://localhost:4002/graphql
          </code>
          .
        </p>
        <label className="mt-4 block max-w-md text-sm">
          <span className="text-muted-foreground">Filter by text</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, description, searchText…"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/15"
          />
        </label>
      </header>

      <div className="shrink-0 flex flex-wrap gap-1 border-b border-border bg-muted/20 px-4 py-2">
        {ENTITY_KINDS.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setKind(e.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              kind === e.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {kind === "organization" && (
          <KgOrganizationPanel key="organization" {...panelProps} />
        )}
        {kind === "product" && <KgProductPanel key="product" {...panelProps} />}
        {kind === "labTest" && (
          <KgLabTestPanel key="labTest" {...panelProps} />
        )}
        {kind === "panelDefinition" && (
          <KgPanelDefinitionPanel key="panelDefinition" {...panelProps} />
        )}
        {kind === "person" && <KgPersonPanel key="person" {...panelProps} />}
        {kind === "study" && <KgStudyPanel key="study" {...panelProps} />}
      </div>
    </div>
  );
}
