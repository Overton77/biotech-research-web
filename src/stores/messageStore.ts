import { create } from "zustand";
import type { Message } from "@/types/api";

interface MessageStore {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  activeToolName: string | null;
  startStreaming: () => void;
  appendToken: (token: string) => void;
  finalizeStream: (threadId: string, finalContent?: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setActiveTool: (toolName: string | null) => void;
  reset: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  streamingContent: "",
  isStreaming: false,
  activeToolName: null,
  startStreaming: () => set({ isStreaming: true, activeToolName: null }),
  appendToken: (token) =>
    set((s) => ({
      streamingContent: s.streamingContent + token,
      isStreaming: true,
    })),
  finalizeStream: (threadId, finalContent) =>
    set((s) => {
      const content = s.streamingContent.trim() ? s.streamingContent : (finalContent ?? "");
      if (!content.trim()) return { isStreaming: false, streamingContent: "", activeToolName: null };
      const newMessage: Message = {
        id: crypto.randomUUID(),
        thread_id: threadId,
        role: "assistant",
        content,
        created_at: new Date().toISOString(),
        metadata: {},
      };
      return {
        messages: [...s.messages, newMessage],
        streamingContent: "",
        isStreaming: false,
        activeToolName: null,
      };
    }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setActiveTool: (activeToolName) => set({ activeToolName }),
  reset: () =>
    set({
      messages: [],
      streamingContent: "",
      isStreaming: false,
      activeToolName: null,
    }),
}));
