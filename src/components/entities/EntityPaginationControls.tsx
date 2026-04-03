"use client";

import { Button } from "@/components/ui/button";

export type PaginationMode = "cursor" | "offset";

type EntityPaginationControlsProps = {
  mode: PaginationMode;
  onModeChange: (m: PaginationMode) => void;
  pageSize: number;
  onPageSizeChange: (n: number) => void;
  cursorNav?: {
    canPrev: boolean;
    canNext: boolean;
    onPrev: () => void;
    onNext: () => void;
  };
  offsetNav?: {
    pageIndex: number;
    totalCount: number;
    onPrev: () => void;
    onNext: () => void;
  };
};

const PAGE_SIZES = [10, 20, 50] as const;

export function EntityPaginationControls({
  mode,
  onModeChange,
  pageSize,
  onPageSizeChange,
  cursorNav,
  offsetNav,
}: EntityPaginationControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border bg-muted/15 px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Paging</span>
        <div className="inline-flex rounded-md border border-border p-0.5">
          <button
            type="button"
            onClick={() => onModeChange("cursor")}
            className={
              mode === "cursor"
                ? "rounded px-2.5 py-1 text-xs font-medium bg-background shadow-sm"
                : "rounded px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            }
          >
            Cursor
          </button>
          <button
            type="button"
            onClick={() => onModeChange("offset")}
            className={
              mode === "offset"
                ? "rounded px-2.5 py-1 text-xs font-medium bg-background shadow-sm"
                : "rounded px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            }
          >
            Offset
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-muted-foreground">
        Page size
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      {mode === "cursor" && cursorNav && (
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!cursorNav.canPrev}
            onClick={cursorNav.onPrev}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!cursorNav.canNext}
            onClick={cursorNav.onNext}
          >
            Next
          </Button>
        </div>
      )}

      {mode === "offset" && offsetNav && (
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Page {offsetNav.pageIndex + 1} ·{" "}
            {Math.min(
              (offsetNav.pageIndex + 1) * pageSize,
              offsetNav.totalCount,
            )}{" "}
            / {offsetNav.totalCount}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={offsetNav.pageIndex <= 0}
            onClick={offsetNav.onPrev}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              (offsetNav.pageIndex + 1) * pageSize >= offsetNav.totalCount
            }
            onClick={offsetNav.onNext}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
