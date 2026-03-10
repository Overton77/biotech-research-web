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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

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
      {/* Message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/70">Start a conversation</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ask the Coordinator to create a research plan when ready.
              </p>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <ToolActivity toolName={activeToolName} />
        {streamingContent && <StreamingMessage content={streamingContent} />}

        {/* Streaming indicator (dots) when streaming but no content yet */}
        {isStreaming && !streamingContent && !activeToolName && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSend}
        className="shrink-0 p-3 border-t border-border bg-background"
      >
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Message the Coordinator… (Enter to send, Shift+Enter for newline)"
              disabled={isStreaming}
              className="w-full resize-none rounded-xl border border-border px-3 py-2.5 text-sm bg-background disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow leading-relaxed"
            />
          </div>
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="shrink-0 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1.5"
          >
            {isStreaming ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                <span className="text-xs">Thinking</span>
              </>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 pl-1">
          Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}
