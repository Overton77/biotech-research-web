"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const articleComponents = {
  h1: ({ className, ...props }: React.ComponentProps<"h1">) => (
    <h1 className={cn("text-xl font-semibold tracking-tight mt-8 mb-3 first:mt-0", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.ComponentProps<"h2">) => (
    <h2 className={cn("text-lg font-semibold mt-6 mb-2 first:mt-0", className)} {...props} />
  ),
  h3: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3 className={cn("text-base font-semibold mt-4 mb-2", className)} {...props} />
  ),
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p className={cn("text-sm leading-relaxed text-foreground/90 mb-3 last:mb-0", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.ComponentProps<"ul">) => (
    <ul className={cn("list-disc pl-5 text-sm space-y-1 mb-3", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.ComponentProps<"ol">) => (
    <ol className={cn("list-decimal pl-5 text-sm space-y-1 mb-3", className)} {...props} />
  ),
  li: ({ className, ...props }: React.ComponentProps<"li">) => (
    <li className={cn("text-foreground/90", className)} {...props} />
  ),
  a: ({ className, ...props }: React.ComponentProps<"a">) => (
    <a
      className={cn("text-primary underline-offset-2 hover:underline font-medium", className)}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  code: ({ className, ...props }: React.ComponentProps<"code">) => (
    <code
      className={cn("rounded bg-muted px-1 py-0.5 text-[0.85em] font-mono", className)}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.ComponentProps<"pre">) => (
    <pre
      className={cn(
        "overflow-x-auto rounded-lg border border-border bg-muted/50 p-3 text-xs font-mono my-3",
        className,
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className={cn("border-l-2 border-primary/40 pl-4 italic text-muted-foreground my-3", className)}
      {...props}
    />
  ),
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="overflow-x-auto my-4">
      <table className={cn("w-full text-sm border-collapse border border-border", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: React.ComponentProps<"th">) => (
    <th className={cn("border border-border bg-muted/40 px-3 py-2 text-left font-medium", className)} {...props} />
  ),
  td: ({ className, ...props }: React.ComponentProps<"td">) => (
    <td className={cn("border border-border px-3 py-2 align-top", className)} {...props} />
  ),
};

export function MarkdownBody({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <div className={cn("max-w-none text-foreground", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={articleComponents}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
