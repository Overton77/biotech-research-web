import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type {
  Thread,
  Message,
  CursorPage,
  PaginatedResponse,
  ResearchPlan,
  ResearchMission,
  ResearchRun,
  MissionStatusSummary,
  MissionOutputs,
  TaskRunOutputs,
  ArtifactRef,
} from "@/types/api";

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

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

export function usePlans(params?: { skip?: number; limit?: number; status_filter?: string }) {
  return useQuery<PaginatedResponse<ResearchPlan>>({
    queryKey: ["plans", params],
    queryFn: () => api.plans.list(params),
  });
}

export function usePlan(id: string) {
  return useQuery<ResearchPlan>({
    queryKey: ["plan", id],
    queryFn: () => api.plans.get(id),
    enabled: !!id,
  });
}

export function useLaunchPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => api.plans.launch(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------

export function useMissions(params?: { skip?: number; limit?: number; status_filter?: string }) {
  return useQuery<PaginatedResponse<ResearchMission>>({
    queryKey: ["missions", params],
    queryFn: () => api.missions.list(params),
  });
}

export function useMission(id: string) {
  return useQuery<ResearchMission>({
    queryKey: ["mission", id],
    queryFn: () => api.missions.get(id),
    enabled: !!id,
  });
}

export function useMissionStatus(id: string, enabled = true) {
  return useQuery<MissionStatusSummary>({
    queryKey: ["mission-status", id],
    queryFn: () => api.missions.status(id),
    enabled: !!id && enabled,
    refetchInterval: 10_000,
  });
}

export function useMissionOutputs(id: string, enabled = true) {
  return useQuery<MissionOutputs>({
    queryKey: ["mission-outputs", id],
    queryFn: () => api.missions.outputs(id),
    enabled: !!id && enabled,
  });
}

export function useMissionRuns(id: string) {
  return useQuery<ResearchRun[]>({
    queryKey: ["mission-runs", id],
    queryFn: () => api.missions.runs(id),
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Runs
// ---------------------------------------------------------------------------

export function useRuns(params?: { skip?: number; limit?: number; mission_id?: string }) {
  return useQuery<PaginatedResponse<ResearchRun>>({
    queryKey: ["runs", params],
    queryFn: () => api.runs.list(params),
  });
}

export function useRun(id: string) {
  return useQuery<ResearchRun>({
    queryKey: ["run", id],
    queryFn: () => api.runs.get(id),
    enabled: !!id,
  });
}

export function useTaskRunOutputs(missionId: string, taskId: string, attemptNumber = 1) {
  return useQuery<TaskRunOutputs>({
    queryKey: ["task-run-outputs", missionId, taskId, attemptNumber],
    queryFn: () => api.missions.runOutputs(missionId, taskId, attemptNumber),
    enabled: !!missionId && !!taskId,
  });
}

export function useTaskArtifacts(missionId: string, taskId: string, attemptNumber = 1) {
  return useQuery<ArtifactRef[]>({
    queryKey: ["task-artifacts", missionId, taskId, attemptNumber],
    queryFn: () => api.missions.artifacts(missionId, taskId, attemptNumber),
    enabled: !!missionId && !!taskId,
  });
}
