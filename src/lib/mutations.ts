import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ResearchPlan } from "@/types/api";

export function useUpdatePlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ResearchPlan> }) =>
      api.plans.update(id, patch),

    onSuccess: async (updatedPlan) => {
      queryClient.setQueryData(["plan", updatedPlan.id], updatedPlan);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["plans"] }),
        queryClient.invalidateQueries({ queryKey: ["plan", updatedPlan.id] }),
      ]);
    },
  });
}

export function useApprovePlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      api.plans.approve(id, notes),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["plans"] }),
        queryClient.invalidateQueries({ queryKey: ["plan", variables.id] }),
      ]);
    },
  });
}

export function useLaunchPlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => api.plans.launch(id),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["plans"] }),
        queryClient.invalidateQueries({ queryKey: ["plan", variables.id] }),
      ]);
    },
  });
}

export function useSaveAndApprovePlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      patch,
      notes,
    }: {
      id: string;
      patch: Partial<ResearchPlan>;
      notes?: string;
    }) => {
      await api.plans.update(id, patch);
      return api.plans.approve(id, notes);
    },

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["plans"] }),
        queryClient.invalidateQueries({ queryKey: ["plan", variables.id] }),
      ]);
    },
  });
}
