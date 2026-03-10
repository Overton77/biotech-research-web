import { create } from "zustand";

type MissionStatus = "idle" | "compiling" | "launched" | "error";

interface PlanStore {
  currentPlan: Record<string, unknown> | null;
  interruptId: string | null;
  isPanelOpen: boolean;

  missionId: string | null;
  missionStatus: MissionStatus;
  missionError: string | null;

  setPlan: (plan: Record<string, unknown> | null, interruptId: string | null) => void;
  openPanel: () => void;
  closePanel: () => void;
  clearPlan: () => void;

  setMissionCompiling: () => void;
  setMissionLaunched: (missionId: string) => void;
  setMissionError: (error: string) => void;
  clearMission: () => void;
}

export const usePlanStore = create<PlanStore>((set) => ({
  currentPlan: null,
  interruptId: null,
  isPanelOpen: false,

  missionId: null,
  missionStatus: "idle",
  missionError: null,

  setPlan: (currentPlan, interruptId) =>
    set({ currentPlan, interruptId, isPanelOpen: true, missionStatus: "idle", missionId: null, missionError: null }),
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  clearPlan: () =>
    set({ currentPlan: null, interruptId: null, isPanelOpen: false, missionId: null, missionStatus: "idle", missionError: null }),

  setMissionCompiling: () => set({ missionStatus: "compiling", missionError: null }),
  setMissionLaunched: (missionId) => set({ missionStatus: "launched", missionId, interruptId: null }),
  setMissionError: (error) => set({ missionStatus: "error", missionError: error }),
  clearMission: () => set({ missionId: null, missionStatus: "idle", missionError: null }),
}));
