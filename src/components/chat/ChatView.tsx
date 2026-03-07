"use client";

import { useRef, useEffect, useCallback } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { useSocket } from "@/providers/SocketProvider";
import { MessageBubble } from "./MessageBubble";
import { StreamingMessage } from "./StreamingMessage";
import { ToolActivity } from "./ToolActivity";
import type { Message } from "@/types/api";

interface ChatViewProps {
  threadId: string;
  initialMessages?: Message[];
}

export function ChatView({ threadId, initialMessages }: ChatViewProps) {
  const socket = useSocket();
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    streamingContent,
    isStreaming,
    activeToolName,
    appendToken,
    finalizeStream,
    setMessages,
    addMessage,
    setActiveTool,
    reset,
  } = useMessageStore();

  useEffect(() => {
    reset();
    if (initialMessages?.length) setMessages(initialMessages);
  }, [threadId, reset, initialMessages, setMessages]);

  useEffect(() => {
    socket.emit("join_thread", { thread_id: threadId });
    return () => {
      socket.off("coordinator_token");
      socket.off("coordinator_tool_start");
      socket.off("coordinator_tool_end");
    };
  }, [socket, threadId]);

  useEffect(() => {
    const onToken = (data: { token?: string; thread_id?: string }) => {
      if (data.thread_id !== threadId) return;
      if (data.token) appendToken(data.token);
    };
    const onToolStart = (data: { tool_name?: string; thread_id?: string }) => {
      if (data.thread_id !== threadId) return;
      setActiveTool(data.tool_name ?? null);
    };
    const onToolEnd = (data: { thread_id?: string }) => {
      if (data.thread_id !== threadId) return;
      setActiveTool(null);
    };
    const onStreamEnd = (data: { thread_id?: string }) => {
      if (data.thread_id !== threadId) return;
      finalizeStream(threadId);
    };
    socket.on("coordinator_token", onToken);
    socket.on("coordinator_tool_start", onToolStart);
    socket.on("coordinator_tool_end", onToolEnd);
    socket.on("coordinator_stream_end", onStreamEnd);
    return () => {
      socket.off("coordinator_token", onToken);
      socket.off("coordinator_tool_start", onToolStart);
      socket.off("coordinator_tool_end", onToolEnd);
      socket.off("coordinator_stream_end", onStreamEnd);
    };
  }, [socket, threadId, appendToken, setActiveTool, finalizeStream]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streamingContent, activeToolName]);

  const handleSend = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const input = form.querySelector(
        "textarea",
      ) as HTMLTextAreaElement | null;
      const content = input?.value?.trim();
      if (!content || isStreaming) return;
      addMessage({
        id: crypto.randomUUID(),
        thread_id: threadId,
        role: "user",
        content,
        created_at: new Date().toISOString(),
        metadata: {},
      });
      socket.emit("send_message", { thread_id: threadId, content });
      if (input) input.value = "";
    },
    [threadId, isStreaming, addMessage, socket, finalizeStream],
  );

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !streamingContent && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Start a new research conversation. Ask for a plan when ready.
          </p>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <ToolActivity toolName={activeToolName} />
        {streamingContent && <StreamingMessage content={streamingContent} />}
      </div>
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-gray-200 dark:border-gray-800"
      >
        <textarea
          name="content"
          rows={2}
          placeholder="Type a message…"
          disabled={isStreaming}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
        />
        <button
          type="submit"
          disabled={isStreaming}
          className="mt-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
        >
          {isStreaming ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
