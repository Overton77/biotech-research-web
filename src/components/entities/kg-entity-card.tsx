"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type KgEntityDetailRow = {
  label: string;
  value: string;
};

export function KgEntityCard({
  title,
  description,
  meta,
  details,
  className,
}: {
  title: string;
  description?: string | null;
  meta?: ReactNode;
  details: readonly KgEntityDetailRow[];
  className?: string;
}) {
  const showDesc =
    description != null && description !== "" && description !== "—";

  return (
    <Card
      className={cn(
        "flex h-full flex-col gap-0 overflow-hidden py-0 shadow-sm transition-[border-color,box-shadow]",
        "border-border/80 hover:border-border hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="space-y-2 border-b border-border/50 bg-muted/15 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm font-semibold leading-snug tracking-tight line-clamp-2 pr-1">
            {title}
          </CardTitle>
          {meta != null && meta !== false && (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
              {meta}
            </div>
          )}
        </div>
        {showDesc && (
          <CardDescription className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2.5 px-4 py-3">
        {details.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 gap-0.5 sm:grid-cols-[minmax(0,6.5rem)_1fr] sm:gap-x-3"
          >
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {row.label}
            </span>
            <span className="min-w-0 wrap-break-word text-xs leading-snug text-foreground/90">
              {row.value || "—"}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function EntityMetaBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "max-w-40 truncate font-normal text-[10px] leading-none",
        className,
      )}
    >
      {children}
    </Badge>
  );
}

export function EntityPanelCardGrid({
  loading,
  rowsEmpty,
  emptyMessage,
  loadingMessage = "Loading…",
  children,
}: {
  loading: boolean;
  rowsEmpty: boolean;
  emptyMessage: string;
  loadingMessage?: string;
  children: ReactNode;
}) {
  if (loading && rowsEmpty) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-10">
        <p className="text-sm text-muted-foreground">{loadingMessage}</p>
      </div>
    );
  }

  if (rowsEmpty) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-10">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="grid auto-rows-fr grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

export function KgPanelErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="mx-4 mt-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
      role="alert"
    >
      {message}
    </div>
  );
}
