"use client";

export function StreamingMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-800">
        <span className="text-sm whitespace-pre-wrap">{content}</span>
        <span className="inline-block w-2 h-4 ml-0.5 bg-gray-600 dark:bg-gray-400 animate-pulse" />
      </div>
    </div>
  );
}
