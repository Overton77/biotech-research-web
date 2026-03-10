import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Thread, Message, CursorPage } from "@/types/api";

export function useThreads() {
  return useQuery<CursorPage<Thread>>({
    queryKey: ["threads"],
    queryFn: () => api.threads.list(),
  });
}

export function useThread(id: string) {
  return useQuery<Thread>({
    queryKey: ["thread", id],
    queryFn: () => api.threads.get(id),
    enabled: !!id,
  });
}

export function useMessages(threadId: string) {
  return useQuery<CursorPage<Message>>({
    queryKey: ["messages", threadId],
    queryFn: () => api.threads.messages(threadId),
    enabled: !!threadId,
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => api.threads.create(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });
}

export function useUpdateThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      api.threads.update(id, title),
    onSuccess: (thread) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.setQueryData(["thread", thread.id], thread);
    },
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.threads.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.removeQueries({ queryKey: ["thread", id] });
      queryClient.removeQueries({ queryKey: ["messages", id] });
    },
  });
}
