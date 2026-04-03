"use client";

import Link from "next/link";

export function WorkspaceHeader() {
  return (
    <header className="flex h-11 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Dashboard
      </Link>
      <span className="text-border select-none" aria-hidden>
        /
      </span>
      <span className="text-xs font-medium text-foreground">Coordinator</span>
    </header>
  );
}
