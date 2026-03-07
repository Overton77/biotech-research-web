"use client";

import { useRef, useEffect, useCallback, useState } from "react";
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
  const [input, setInput] = useState("");
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
    const onError = (data: { message?: string; thread_id?: string }) => {
      if (data.thread_id && data.thread_id !== threadId) return;
      console.error("Socket error:", data.message);
      finalizeStream(threadId);
    };

    socket.on("coordinator_token", onToken);
    socket.on("coordinator_tool_start", onToolStart);
    socket.on("coordinator_tool_end", onToolEnd);
    socket.on("coordinator_stream_end", onStreamEnd);
    socket.on("error", onError);

    return () => {
      socket.off("coordinator_token", onToken);
      socket.off("coordinator_tool_start", onToolStart);
      socket.off("coordinator_tool_end", onToolEnd);
      socket.off("coordinator_stream_end", onStreamEnd);
      socket.off("error", onError);
    };
  }, [socket, threadId, appendToken, setActiveTool, finalizeStream]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streamingContent, activeToolName]);

  const handleSend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const content = input.trim();
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
      setInput("");
    },
    [threadId, isStreaming, addMessage, socket, input],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend(e as unknown as React.FormEvent);
      }
    },
    [handleSend],
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !streamingContent && (
          <div className="text-center py-12">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Start a conversation. Ask the Coordinator to create a research plan when ready.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <ToolActivity toolName={activeToolName} />
        {streamingContent && <StreamingMessage content={streamingContent} />}
      </div>
      <form
        onSubmit={handleSend}
        className="shrink-0 p-3 border-t border-border bg-background"
      >
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
            disabled={isStreaming}
            className="flex-1 resize-none rounded-lg border border-border px-3 py-2 text-sm bg-background disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="shrink-0 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isStreaming ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
