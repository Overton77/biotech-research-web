import { create } from "zustand";
import type { ResearchPlan } from "@/types/api";

type MissionStatus = "idle" | "compiling" | "launched" | "error";

interface PlanStore {
  currentPlan: ResearchPlan | null;
  currentThreadId: string | null;
  interruptId: string | null;
  isPanelOpen: boolean;

  missionId: string | null;
  missionStatus: MissionStatus;
  missionError: string | null;

  setPlan: (plan: ResearchPlan | null, interruptId: string | null, threadId: string) => void;
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
  currentThreadId: null,
  interruptId: null,
  isPanelOpen: false,

  missionId: null,
  missionStatus: "idle",
  missionError: null,

  setPlan: (currentPlan, interruptId, threadId) =>
    set({
      currentPlan,
      currentThreadId: threadId,
      interruptId,
      isPanelOpen: true,
      missionStatus: "idle",
      missionId: null,
      missionError: null,
    }),
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  clearPlan: () =>
    set({
      currentPlan: null,
      currentThreadId: null,
      interruptId: null,
      isPanelOpen: false,
      missionId: null,
      missionStatus: "idle",
      missionError: null,
    }),

  setMissionCompiling: () => set({ missionStatus: "compiling", missionError: null }),
  setMissionLaunched: (missionId) => set({ missionStatus: "launched", missionId, interruptId: null }),
  setMissionError: (error) => set({ missionStatus: "error", missionError: error }),
  clearMission: () => set({ missionId: null, missionStatus: "idle", missionError: null }),
}));
