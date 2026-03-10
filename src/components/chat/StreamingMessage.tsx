"use client";

export function StreamingMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
        <span className="text-sm whitespace-pre-wrap leading-relaxed">{content}</span>
        <span className="inline-block w-0.5 h-4 ml-0.5 bg-foreground/60 animate-pulse align-text-bottom" />
      </div>
    </div>
  );
}
