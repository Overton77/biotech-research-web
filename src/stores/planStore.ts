import { create } from "zustand";

interface PlanStore {
  currentPlan: Record<string, unknown> | null;
  interruptId: string | null;
  isPanelOpen: boolean;
  setPlan: (plan: Record<string, unknown> | null, interruptId: string | null) => void;
  openPanel: () => void;
  closePanel: () => void;
  clearPlan: () => void;
}

export const usePlanStore = create<PlanStore>((set) => ({
  currentPlan: null,
  interruptId: null,
  isPanelOpen: false,
  setPlan: (currentPlan, interruptId) =>
    set({ currentPlan, interruptId, isPanelOpen: true }),
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  clearPlan: () =>
    set({ currentPlan: null, interruptId: null, isPanelOpen: false }),
}));
