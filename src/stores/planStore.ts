import { create } from "zustand";
import type { ResearchPlan } from "@/types/api";

interface PlanStore {
  currentPlan: ResearchPlan | null;
  interruptId: string | null;
  isPanelOpen: boolean;
  isEditing: boolean;
  setPlan: (plan: ResearchPlan | null, interruptId: string | null) => void;
  openPanel: () => void;
  closePanel: () => void;
  startEditing: () => void;
  stopEditing: () => void;
  clearPlan: () => void;
}

export const usePlanStore = create<PlanStore>((set) => ({
  currentPlan: null,
  interruptId: null,
  isPanelOpen: false,
  isEditing: false,
  setPlan: (currentPlan, interruptId) =>
    set({ currentPlan, interruptId, isPanelOpen: true }),
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  startEditing: () => set({ isEditing: true }),
  stopEditing: () => set({ isEditing: false }),
  clearPlan: () =>
    set({
      currentPlan: null,
      interruptId: null,
      isPanelOpen: false,
      isEditing: false,
    }),
}));
