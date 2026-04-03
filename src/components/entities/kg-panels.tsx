"use client";

import { useQuery } from "@apollo/client";
import { useDeferredValue, useEffect, useMemo, useState, useCallback } from "react";

import {
  DashboardLabTestTotalDocument,
  DashboardLabTestsDocument,
  DashboardLabTestsOffsetDocument,
  DashboardOrganizationTotalDocument,
  DashboardOrganizationsDocument,
  DashboardOrganizationsOffsetDocument,
  DashboardPanelDefinitionTotalDocument,
  DashboardPanelDefinitionsDocument,
  DashboardPanelDefinitionsOffsetDocument,
  DashboardPeopleDocument,
  DashboardPeopleOffsetDocument,
  DashboardPersonTotalDocument,
  DashboardProductTotalDocument,
  DashboardProductsDocument,
  DashboardProductsOffsetDocument,
  DashboardStudiesDocument,
  DashboardStudiesOffsetDocument,
  DashboardStudyTotalDocument,
} from "@/gql/graphql";

import {
  labTestSearchWhere,
  organizationSearchWhere,
  panelDefinitionSearchWhere,
  personSearchWhere,
  productSearchWhere,
  studySearchWhere,
} from "./entity-search-where";
import {
  EntityMetaBadge,
  EntityPanelCardGrid,
  KgEntityCard,
  KgPanelErrorBanner,
} from "./kg-entity-card";
import {
  EntityPaginationControls,
  type PaginationMode,
} from "./EntityPaginationControls";

function fmtDate(v: unknown): string {
  if (v == null) return "—";
  try {
    const d = new Date(v as string);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

function clip(s: string | null | undefined, max: number): string {
  if (!s) return "—";
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

function useCursorStack() {
  const [after, setAfter] = useState<string | null>(null);
  const [stack, setStack] = useState<(string | null)[]>([]);

  const reset = useCallback(() => {
    setAfter(null);
    setStack([]);
  }, []);

  const goNext = useCallback(
    (endCursor: string) => {
      setStack((s) => [...s, after]);
      setAfter(endCursor);
    },
    [after],
  );

  const goPrev = useCallback(() => {
    setStack((s) => {
      if (s.length === 0) return s;
      const next = [...s];
      const prev = next.pop() ?? null;
      setAfter(prev);
      return next;
    });
  }, []);

  const canPrev = stack.length > 0;

  return { after, reset, goNext, goPrev, canPrev };
}

export type KgPanelProps = {
  search: string;
  paginationMode: PaginationMode;
  pageSize: number;
  onPageSizeChange: (n: number) => void;
  onPaginationModeChange: (m: PaginationMode) => void;
};

function AggregatesStrip(props: {
  totalCount: number;
  aggregate?: {
    count: { nodes: number };
    node: {
      createdAt: { min?: unknown; max?: unknown };
      enrollmentCount?: {
        min?: number | null;
        max?: number | null;
        average?: number | null;
      };
    };
  } | null;
  showEnrollment?: boolean;
}) {
  const { totalCount, aggregate, showEnrollment } = props;
  const minC = aggregate?.node.createdAt.min;
  const maxC = aggregate?.node.createdAt.max;
  const enc = aggregate?.node.enrollmentCount;

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-border px-4 py-3 text-xs text-muted-foreground">
      <span>
        <strong className="font-medium text-foreground">{totalCount}</strong> total
      </span>
      {aggregate && (
        <>
          <span>
            Aggregate count:{" "}
            <strong className="font-medium text-foreground">
              {aggregate.count.nodes}
            </strong>
          </span>
          <span>createdAt min: {fmtDate(minC)}</span>
          <span>createdAt max: {fmtDate(maxC)}</span>
          {showEnrollment && enc && (
            <span>
              enrollment (min/max/avg): {enc.min ?? "—"} / {enc.max ?? "—"} /{" "}
              {enc.average != null ? enc.average.toFixed(1) : "—"}
            </span>
          )}
        </>
      )}
    </div>
  );
}

export function KgOrganizationPanel(p: KgPanelProps) {
  const q = useDeferredValue(p.search);
  const where = useMemo(() => organizationSearchWhere(q), [q]);
  const [pageIndex, setPageIndex] = useState(0);
  const { after, reset, goNext, goPrev, canPrev } = useCursorStack();

  useEffect(() => {
    reset();
    setPageIndex(0);
  }, [q, p.pageSize, p.paginationMode, reset]);

  const conn = useQuery(DashboardOrganizationsDocument, {
    variables: { first: p.pageSize, after, where },
    skip: p.paginationMode !== "cursor",
  });

  const listOff = useQuery(DashboardOrganizationsOffsetDocument, {
    variables: {
      limit: p.pageSize,
      offset: pageIndex * p.pageSize,
      where,
    },
    skip: p.paginationMode !== "offset",
  });

  const aggOff = useQuery(DashboardOrganizationsDocument, {
    variables: { first: 1, after: null, where },
    skip: p.paginationMode !== "offset",
  });

  const totalOff = useQuery(DashboardOrganizationTotalDocument, {
    variables: { where },
    skip: p.paginationMode !== "offset",
  });

  const loading =
    p.paginationMode === "cursor"
      ? conn.loading
      : listOff.loading || totalOff.loading || aggOff.loading;
  const error =
    p.paginationMode === "cursor"
      ? conn.error
      : listOff.error ?? totalOff.error ?? aggOff.error;

  const dataConn = conn.data?.organizationsConnection;
  const rows =
    p.paginationMode === "cursor"
      ? (dataConn?.edges.map((e) => e.node) ?? [])
      : (listOff.data?.organizations ?? []);

  const totalCount =
    p.paginationMode === "cursor"
      ? (dataConn?.totalCount ?? 0)
      : (totalOff.data?.organizationsConnection.totalCount ?? 0);

  const aggregate =
    p.paginationMode === "cursor"
      ? dataConn?.aggregate
      : aggOff.data?.organizationsConnection.aggregate;

  const hasNextCursor = Boolean(dataConn?.pageInfo.hasNextPage);
  const endCursor = dataConn?.pageInfo.endCursor;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AggregatesStrip totalCount={totalCount} aggregate={aggregate ?? null} />

      {error && <KgPanelErrorBanner message={error.message} />}

      <EntityPanelCardGrid
        loading={loading}
        rowsEmpty={rows.length === 0}
        emptyMessage="No organizations match."
      >
        {rows.map((n) => (
          <KgEntityCard
            key={n.id}
            title={n.name}
            meta={
              n.canonicalTicker ? (
                <EntityMetaBadge>{n.canonicalTicker}</EntityMetaBadge>
              ) : undefined
            }
            description={clip(n.description, 120)}
            details={[
              {
                label: "States",
                value: n.states.map((s) => s.name).join(", ") || "—",
              },
              {
                label: "Offers",
                value: n.offersProducts.map((x) => x.name).join(", ") || "—",
              },
            ]}
          />
        ))}
      </EntityPanelCardGrid>

      <EntityPaginationControls
        mode={p.paginationMode}
        onModeChange={p.onPaginationModeChange}
        pageSize={p.pageSize}
        onPageSizeChange={p.onPageSizeChange}
        cursorNav={
          p.paginationMode === "cursor"
            ? {
                canPrev,
                canNext: hasNextCursor && Boolean(endCursor),
                onPrev: goPrev,
                onNext: () => {
                  if (endCursor) goNext(endCursor);
                },
              }
            : undefined
        }
        offsetNav={
          p.paginationMode === "offset"
            ? {
                pageIndex,
                totalCount,
                onPrev: () => setPageIndex((x) => Math.max(0, x - 1)),
                onNext: () => {
                  if ((pageIndex + 1) * p.pageSize < totalCount) {
                    setPageIndex((x) => x + 1);
                  }
                },
              }
            : undefined
        }
      />
    </div>
  );
}

export function KgProductPanel(p: KgPanelProps) {
  const q = useDeferredValue(p.search);
  const where = useMemo(() => productSearchWhere(q), [q]);
  const [pageIndex, setPageIndex] = useState(0);
  const { after, reset, goNext, goPrev, canPrev } = useCursorStack();

  useEffect(() => {
    reset();
    setPageIndex(0);
  }, [q, p.pageSize, p.paginationMode, reset]);

  const conn = useQuery(DashboardProductsDocument, {
    variables: { first: p.pageSize, after, where },
    skip: p.paginationMode !== "cursor",
  });

  const listOff = useQuery(DashboardProductsOffsetDocument, {
    variables: {
      limit: p.pageSize,
      offset: pageIndex * p.pageSize,
      where,
    },
    skip: p.paginationMode !== "offset",
  });

  const aggOff = useQuery(DashboardProductsDocument, {
    variables: { first: 1, after: null, where },
    skip: p.paginationMode !== "offset",
  });

  const totalOff = useQuery(DashboardProductTotalDocument, {
    variables: { where },
    skip: p.paginationMode !== "offset",
  });

  const loading =
    p.paginationMode === "cursor"
      ? conn.loading
      : listOff.loading || totalOff.loading || aggOff.loading;
  const error =
    p.paginationMode === "cursor"
      ? conn.error
      : listOff.error ?? totalOff.error ?? aggOff.error;

  const dataConn = conn.data?.productsConnection;
  const rows =
    p.paginationMode === "cursor"
      ? (dataConn?.edges.map((e) => e.node) ?? [])
      : (listOff.data?.products ?? []);

  const totalCount =
    p.paginationMode === "cursor"
      ? (dataConn?.totalCount ?? 0)
      : (totalOff.data?.productsConnection.totalCount ?? 0);

  const aggregate =
    p.paginationMode === "cursor"
      ? dataConn?.aggregate
      : aggOff.data?.productsConnection.aggregate;

  const hasNextCursor = Boolean(dataConn?.pageInfo.hasNextPage);
  const endCursor = dataConn?.pageInfo.endCursor;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AggregatesStrip totalCount={totalCount} aggregate={aggregate ?? null} />

      {error && <KgPanelErrorBanner message={error.message} />}

      <EntityPanelCardGrid
        loading={loading}
        rowsEmpty={rows.length === 0}
        emptyMessage="No products match."
      >
        {rows.map((n) => (
          <KgEntityCard
            key={n.id}
            title={n.name}
            meta={
              n.primaryRegulatoryIdentifier ? (
                <EntityMetaBadge>{n.primaryRegulatoryIdentifier}</EntityMetaBadge>
              ) : undefined
            }
            description={clip(n.description, 100)}
            details={[
              {
                label: "Offered by",
                value: n.offeredBy.map((o) => o.name).join(", ") || "—",
              },
              {
                label: "Lab tests",
                value: n.deliversLabTests.map((t) => t.name).join(", ") || "—",
              },
              {
                label: "Panels",
                value: n.implementsPanels.map((x) => x.name).join(", ") || "—",
              },
            ]}
          />
        ))}
      </EntityPanelCardGrid>

      <EntityPaginationControls
        mode={p.paginationMode}
        onModeChange={p.onPaginationModeChange}
        pageSize={p.pageSize}
        onPageSizeChange={p.onPageSizeChange}
        cursorNav={
          p.paginationMode === "cursor"
            ? {
                canPrev,
                canNext: hasNextCursor && Boolean(endCursor),
                onPrev: goPrev,
                onNext: () => {
                  if (endCursor) goNext(endCursor);
                },
              }
            : undefined
        }
        offsetNav={
          p.paginationMode === "offset"
            ? {
                pageIndex,
                totalCount,
                onPrev: () => setPageIndex((x) => Math.max(0, x - 1)),
                onNext: () => {
                  if ((pageIndex + 1) * p.pageSize < totalCount) {
                    setPageIndex((x) => x + 1);
                  }
                },
              }
            : undefined
        }
      />
    </div>
  );
}

export function KgLabTestPanel(p: KgPanelProps) {
  const q = useDeferredValue(p.search);
  const where = useMemo(() => labTestSearchWhere(q), [q]);
  const [pageIndex, setPageIndex] = useState(0);
  const { after, reset, goNext, goPrev, canPrev } = useCursorStack();

  useEffect(() => {
    reset();
    setPageIndex(0);
  }, [q, p.pageSize, p.paginationMode, reset]);

  const conn = useQuery(DashboardLabTestsDocument, {
    variables: { first: p.pageSize, after, where },
    skip: p.paginationMode !== "cursor",
  });

  const listOff = useQuery(DashboardLabTestsOffsetDocument, {
    variables: {
      limit: p.pageSize,
      offset: pageIndex * p.pageSize,
      where,
    },
    skip: p.paginationMode !== "offset",
  });

  const aggOff = useQuery(DashboardLabTestsDocument, {
    variables: { first: 1, after: null, where },
    skip: p.paginationMode !== "offset",
  });

  const totalOff = useQuery(DashboardLabTestTotalDocument, {
    variables: { where },
    skip: p.paginationMode !== "offset",
  });

  const loading =
    p.paginationMode === "cursor"
      ? conn.loading
      : listOff.loading || totalOff.loading || aggOff.loading;
  const error =
    p.paginationMode === "cursor"
      ? conn.error
      : listOff.error ?? totalOff.error ?? aggOff.error;

  const dataConn = conn.data?.labTestsConnection;
  const rows =
    p.paginationMode === "cursor"
      ? (dataConn?.edges.map((e) => e.node) ?? [])
      : (listOff.data?.labTests ?? []);

  const totalCount =
    p.paginationMode === "cursor"
      ? (dataConn?.totalCount ?? 0)
      : (totalOff.data?.labTestsConnection.totalCount ?? 0);

  const aggregate =
    p.paginationMode === "cursor"
      ? dataConn?.aggregate
      : aggOff.data?.labTestsConnection.aggregate;

  const hasNextCursor = Boolean(dataConn?.pageInfo.hasNextPage);
  const endCursor = dataConn?.pageInfo.endCursor;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AggregatesStrip totalCount={totalCount} aggregate={aggregate ?? null} />

      {error && <KgPanelErrorBanner message={error.message} />}

      <EntityPanelCardGrid
        loading={loading}
        rowsEmpty={rows.length === 0}
        emptyMessage="No lab tests match."
      >
        {rows.map((n) => (
          <KgEntityCard
            key={n.id}
            title={n.name}
            meta={
              n.testType ? <EntityMetaBadge>{n.testType}</EntityMetaBadge> : undefined
            }
            description={clip(n.description, 100)}
            details={[
              {
                label: "Biomarkers",
                value: n.measuresBiomarkers.map((b) => b.name).join(", ") || "—",
              },
              {
                label: "Platforms",
                value: n.usesPlatforms.map((x) => x.name).join(", ") || "—",
              },
            ]}
          />
        ))}
      </EntityPanelCardGrid>

      <EntityPaginationControls
        mode={p.paginationMode}
        onModeChange={p.onPaginationModeChange}
        pageSize={p.pageSize}
        onPageSizeChange={p.onPageSizeChange}
        cursorNav={
          p.paginationMode === "cursor"
            ? {
                canPrev,
                canNext: hasNextCursor && Boolean(endCursor),
                onPrev: goPrev,
                onNext: () => {
                  if (endCursor) goNext(endCursor);
                },
              }
            : undefined
        }
        offsetNav={
          p.paginationMode === "offset"
            ? {
                pageIndex,
                totalCount,
                onPrev: () => setPageIndex((x) => Math.max(0, x - 1)),
                onNext: () => {
                  if ((pageIndex + 1) * p.pageSize < totalCount) {
                    setPageIndex((x) => x + 1);
                  }
                },
              }
            : undefined
        }
      />
    </div>
  );
}

export function KgPanelDefinitionPanel(p: KgPanelProps) {
  const q = useDeferredValue(p.search);
  const where = useMemo(() => panelDefinitionSearchWhere(q), [q]);
  const [pageIndex, setPageIndex] = useState(0);
  const { after, reset, goNext, goPrev, canPrev } = useCursorStack();

  useEffect(() => {
    reset();
    setPageIndex(0);
  }, [q, p.pageSize, p.paginationMode, reset]);

  const conn = useQuery(DashboardPanelDefinitionsDocument, {
    variables: { first: p.pageSize, after, where },
    skip: p.paginationMode !== "cursor",
  });

  const listOff = useQuery(DashboardPanelDefinitionsOffsetDocument, {
    variables: {
      limit: p.pageSize,
      offset: pageIndex * p.pageSize,
      where,
    },
    skip: p.paginationMode !== "offset",
  });

  const aggOff = useQuery(DashboardPanelDefinitionsDocument, {
    variables: { first: 1, after: null, where },
    skip: p.paginationMode !== "offset",
  });

  const totalOff = useQuery(DashboardPanelDefinitionTotalDocument, {
    variables: { where },
    skip: p.paginationMode !== "offset",
  });

  const loading =
    p.paginationMode === "cursor"
      ? conn.loading
      : listOff.loading || totalOff.loading || aggOff.loading;
  const error =
    p.paginationMode === "cursor"
      ? conn.error
      : listOff.error ?? totalOff.error ?? aggOff.error;

  const dataConn = conn.data?.panelDefinitionsConnection;
  const rows =
    p.paginationMode === "cursor"
      ? (dataConn?.edges.map((e) => e.node) ?? [])
      : (listOff.data?.panelDefinitions ?? []);

  const totalCount =
    p.paginationMode === "cursor"
      ? (dataConn?.totalCount ?? 0)
      : (totalOff.data?.panelDefinitionsConnection.totalCount ?? 0);

  const aggregate =
    p.paginationMode === "cursor"
      ? dataConn?.aggregate
      : aggOff.data?.panelDefinitionsConnection.aggregate;

  const hasNextCursor = Boolean(dataConn?.pageInfo.hasNextPage);
  const endCursor = dataConn?.pageInfo.endCursor;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AggregatesStrip totalCount={totalCount} aggregate={aggregate ?? null} />

      {error && <KgPanelErrorBanner message={error.message} />}

      <EntityPanelCardGrid
        loading={loading}
        rowsEmpty={rows.length === 0}
        emptyMessage="No panel definitions match."
      >
        {rows.map((n) => (
          <KgEntityCard
            key={n.id}
            title={n.name}
            meta={
              n.panelType || n.versionLabel ? (
                <>
                  {n.panelType ? (
                    <EntityMetaBadge>{n.panelType}</EntityMetaBadge>
                  ) : null}
                  {n.versionLabel ? (
                    <EntityMetaBadge className="max-w-24">
                      v{n.versionLabel}
                    </EntityMetaBadge>
                  ) : null}
                </>
              ) : undefined
            }
            description={clip(n.description, 100)}
            details={[
              {
                label: "Lab tests",
                value: n.includesLabTests.map((t) => t.name).join(", ") || "—",
              },
            ]}
          />
        ))}
      </EntityPanelCardGrid>

      <EntityPaginationControls
        mode={p.paginationMode}
        onModeChange={p.onPaginationModeChange}
        pageSize={p.pageSize}
        onPageSizeChange={p.onPageSizeChange}
        cursorNav={
          p.paginationMode === "cursor"
            ? {
                canPrev,
                canNext: hasNextCursor && Boolean(endCursor),
                onPrev: goPrev,
                onNext: () => {
                  if (endCursor) goNext(endCursor);
                },
              }
            : undefined
        }
        offsetNav={
          p.paginationMode === "offset"
            ? {
                pageIndex,
                totalCount,
                onPrev: () => setPageIndex((x) => Math.max(0, x - 1)),
                onNext: () => {
                  if ((pageIndex + 1) * p.pageSize < totalCount) {
                    setPageIndex((x) => x + 1);
                  }
                },
              }
            : undefined
        }
      />
    </div>
  );
}

export function KgPersonPanel(p: KgPanelProps) {
  const q = useDeferredValue(p.search);
  const where = useMemo(() => personSearchWhere(q), [q]);
  const [pageIndex, setPageIndex] = useState(0);
  const { after, reset, goNext, goPrev, canPrev } = useCursorStack();

  useEffect(() => {
    reset();
    setPageIndex(0);
  }, [q, p.pageSize, p.paginationMode, reset]);

  const conn = useQuery(DashboardPeopleDocument, {
    variables: { first: p.pageSize, after, where },
    skip: p.paginationMode !== "cursor",
  });

  const listOff = useQuery(DashboardPeopleOffsetDocument, {
    variables: {
      limit: p.pageSize,
      offset: pageIndex * p.pageSize,
      where,
    },
    skip: p.paginationMode !== "offset",
  });

  const aggOff = useQuery(DashboardPeopleDocument, {
    variables: { first: 1, after: null, where },
    skip: p.paginationMode !== "offset",
  });

  const totalOff = useQuery(DashboardPersonTotalDocument, {
    variables: { where },
    skip: p.paginationMode !== "offset",
  });

  const loading =
    p.paginationMode === "cursor"
      ? conn.loading
      : listOff.loading || totalOff.loading || aggOff.loading;
  const error =
    p.paginationMode === "cursor"
      ? conn.error
      : listOff.error ?? totalOff.error ?? aggOff.error;

  const dataConn = conn.data?.peopleConnection;
  const rows =
    p.paginationMode === "cursor"
      ? (dataConn?.edges.map((e) => e.node) ?? [])
      : (listOff.data?.people ?? []);

  const totalCount =
    p.paginationMode === "cursor"
      ? (dataConn?.totalCount ?? 0)
      : (totalOff.data?.peopleConnection.totalCount ?? 0);

  const aggregate =
    p.paginationMode === "cursor"
      ? dataConn?.aggregate
      : aggOff.data?.peopleConnection.aggregate;

  const hasNextCursor = Boolean(dataConn?.pageInfo.hasNextPage);
  const endCursor = dataConn?.pageInfo.endCursor;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AggregatesStrip totalCount={totalCount} aggregate={aggregate ?? null} />

      {error && <KgPanelErrorBanner message={error.message} />}

      <EntityPanelCardGrid
        loading={loading}
        rowsEmpty={rows.length === 0}
        emptyMessage="No people match."
      >
        {rows.map((n) => (
          <KgEntityCard
            key={n.id}
            title={n.name}
            meta={
              n.title ? <EntityMetaBadge>{n.title}</EntityMetaBadge> : undefined
            }
            description={clip(n.bio ?? n.description, 100)}
            details={[
              {
                label: "Affiliations",
                value: n.affiliatedWith.map((o) => o.name).join(", ") || "—",
              },
              {
                label: "Roles",
                value: n.holdsRoleAt.map((o) => o.name).join(", ") || "—",
              },
            ]}
          />
        ))}
      </EntityPanelCardGrid>

      <EntityPaginationControls
        mode={p.paginationMode}
        onModeChange={p.onPaginationModeChange}
        pageSize={p.pageSize}
        onPageSizeChange={p.onPageSizeChange}
        cursorNav={
          p.paginationMode === "cursor"
            ? {
                canPrev,
                canNext: hasNextCursor && Boolean(endCursor),
                onPrev: goPrev,
                onNext: () => {
                  if (endCursor) goNext(endCursor);
                },
              }
            : undefined
        }
        offsetNav={
          p.paginationMode === "offset"
            ? {
                pageIndex,
                totalCount,
                onPrev: () => setPageIndex((x) => Math.max(0, x - 1)),
                onNext: () => {
                  if ((pageIndex + 1) * p.pageSize < totalCount) {
                    setPageIndex((x) => x + 1);
                  }
                },
              }
            : undefined
        }
      />
    </div>
  );
}

function evalLabel(
  x:
    | { __typename: "Product"; name: string }
    | { __typename: "Compound"; name: string }
    | { __typename: "CompoundForm"; name: string }
    | { __typename: "FoodItem"; name: string },
): string {
  const short = x.__typename.replace(/([A-Z])/g, " $1").trim();
  return `${short}: ${x.name}`;
}

export function KgStudyPanel(p: KgPanelProps) {
  const q = useDeferredValue(p.search);
  const where = useMemo(() => studySearchWhere(q), [q]);
  const [pageIndex, setPageIndex] = useState(0);
  const { after, reset, goNext, goPrev, canPrev } = useCursorStack();

  useEffect(() => {
    reset();
    setPageIndex(0);
  }, [q, p.pageSize, p.paginationMode, reset]);

  const conn = useQuery(DashboardStudiesDocument, {
    variables: { first: p.pageSize, after, where },
    skip: p.paginationMode !== "cursor",
  });

  const listOff = useQuery(DashboardStudiesOffsetDocument, {
    variables: {
      limit: p.pageSize,
      offset: pageIndex * p.pageSize,
      where,
    },
    skip: p.paginationMode !== "offset",
  });

  const aggOff = useQuery(DashboardStudiesDocument, {
    variables: { first: 1, after: null, where },
    skip: p.paginationMode !== "offset",
  });

  const totalOff = useQuery(DashboardStudyTotalDocument, {
    variables: { where },
    skip: p.paginationMode !== "offset",
  });

  const loading =
    p.paginationMode === "cursor"
      ? conn.loading
      : listOff.loading || totalOff.loading || aggOff.loading;
  const error =
    p.paginationMode === "cursor"
      ? conn.error
      : listOff.error ?? totalOff.error ?? aggOff.error;

  const dataConn = conn.data?.studiesConnection;
  const rows =
    p.paginationMode === "cursor"
      ? (dataConn?.edges.map((e) => e.node) ?? [])
      : (listOff.data?.studies ?? []);

  const totalCount =
    p.paginationMode === "cursor"
      ? (dataConn?.totalCount ?? 0)
      : (totalOff.data?.studiesConnection.totalCount ?? 0);

  const aggregate =
    p.paginationMode === "cursor"
      ? dataConn?.aggregate
      : aggOff.data?.studiesConnection.aggregate;

  const hasNextCursor = Boolean(dataConn?.pageInfo.hasNextPage);
  const endCursor = dataConn?.pageInfo.endCursor;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AggregatesStrip
        totalCount={totalCount}
        aggregate={aggregate ?? null}
        showEnrollment
      />

      {error && <KgPanelErrorBanner message={error.message} />}

      <EntityPanelCardGrid
        loading={loading}
        rowsEmpty={rows.length === 0}
        emptyMessage="No studies match."
      >
        {rows.map((n) => (
          <KgEntityCard
            key={n.id}
            title={clip(n.name, 120)}
            meta={
              n.overallStatus ||
              n.studyPhase ||
              n.enrollmentCount != null ? (
                <>
                  {n.overallStatus ? (
                    <EntityMetaBadge>{n.overallStatus}</EntityMetaBadge>
                  ) : null}
                  {n.studyPhase ? (
                    <EntityMetaBadge>{n.studyPhase}</EntityMetaBadge>
                  ) : null}
                  {n.enrollmentCount != null ? (
                    <EntityMetaBadge>N={String(n.enrollmentCount)}</EntityMetaBadge>
                  ) : null}
                </>
              ) : undefined
            }
            description={clip(n.description, 140)}
            details={[
              {
                label: "Sponsor",
                value: n.sponsoredBy.map((o) => o.name).join(", ") || "—",
              },
              {
                label: "Interventions",
                value: n.evaluates.map((x) => evalLabel(x)).join("; ") || "—",
              },
            ]}
          />
        ))}
      </EntityPanelCardGrid>

      <EntityPaginationControls
        mode={p.paginationMode}
        onModeChange={p.onPaginationModeChange}
        pageSize={p.pageSize}
        onPageSizeChange={p.onPageSizeChange}
        cursorNav={
          p.paginationMode === "cursor"
            ? {
                canPrev,
                canNext: hasNextCursor && Boolean(endCursor),
                onPrev: goPrev,
                onNext: () => {
                  if (endCursor) goNext(endCursor);
                },
              }
            : undefined
        }
        offsetNav={
          p.paginationMode === "offset"
            ? {
                pageIndex,
                totalCount,
                onPrev: () => setPageIndex((x) => Math.max(0, x - 1)),
                onNext: () => {
                  if ((pageIndex + 1) * p.pageSize < totalCount) {
                    setPageIndex((x) => x + 1);
                  }
                },
              }
            : undefined
        }
      />
    </div>
  );
}
