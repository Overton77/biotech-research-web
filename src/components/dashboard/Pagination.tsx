"use client";

interface PaginationProps {
  skip: number;
  limit: number;
  total: number;
  onPageChange: (newSkip: number) => void;
}

export function Pagination({ skip, limit, total, onPageChange }: PaginationProps) {
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasPrev = skip > 0;
  const hasNext = skip + limit < total;

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <span className="text-xs text-muted-foreground">
        {total === 0 ? "No results" : `${skip + 1}–${Math.min(skip + limit, total)} of ${total}`}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(0, skip - limit))}
          disabled={!hasPrev}
          className="px-2.5 py-1 text-xs rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <span className="text-xs text-muted-foreground px-2">
          {currentPage}/{totalPages}
        </span>
        <button
          onClick={() => onPageChange(skip + limit)}
          disabled={!hasNext}
          className="px-2.5 py-1 text-xs rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
