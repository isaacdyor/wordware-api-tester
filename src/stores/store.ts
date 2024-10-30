import { create } from "zustand";
import { AppWithVersions, Ask, VersionWithRuns, Output } from "@/types/types";

interface StoreState {
  apps: AppWithVersions[] | null;
  apiKey: string;
  currentApp: AppWithVersions | null;
  currentVersion: VersionWithRuns | null;
  runStatus: "COMPLETE" | "RUNNING" | "AWAITING_INPUT" | "ERROR" | null;
  outputs: Output[];
  outputRef: React.MutableRefObject<Output[]>;
  ask: Ask | null;
  runId: string | null;
  autoScroll: boolean;

  // Actions
  updateApps: (newApps: AppWithVersions[] | null) => void;
  updateApiKey: (newApiKey: string) => void;
  updateApp: (updatedApp: AppWithVersions) => void;
  updateVersion: (appSlug: string, version: string) => void;
  setCurrentApp: (app: AppWithVersions | null) => void;
  setCurrentVersion: (version: VersionWithRuns | null) => void;
  setRunStatus: (
    status: "COMPLETE" | "RUNNING" | "AWAITING_INPUT" | "ERROR" | null,
  ) => void;
  setOutputs: (newOutputs: Output[]) => void;
  setAsk: (ask: Ask | null) => void;
  setRunId: (runId: string | null) => void;
  getCurrentApp: (appSlug: string | null) => AppWithVersions | null;
  setAutoScroll: (autoScroll: boolean) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state with values from localStorage
  apps: null,
  apiKey: "",
  currentApp: null,
  currentVersion: null,
  runStatus: null,
  outputs: [],
  outputRef: { current: [] },
  ask: null,
  runId: null,
  autoScroll: true,
  // Actions
  updateApps: (newApps) => {
    if (newApps) {
      localStorage.setItem("apps", JSON.stringify(newApps));
    } else {
      localStorage.removeItem("apps");
    }
    set({ apps: newApps });
  },

  updateApiKey: (newApiKey) => {
    localStorage.setItem("apiKey", newApiKey);
    set({ apiKey: newApiKey });
  },

  updateApp: (updatedApp) => {
    set((state) => {
      const newApps =
        state.apps?.map((app) =>
          app.appSlug === updatedApp.appSlug ? updatedApp : app,
        ) || null;
      if (newApps) {
        localStorage.setItem("apps", JSON.stringify(newApps));
      }
      return { apps: newApps };
    });
  },

  updateVersion: (appSlug, version) => {
    set((state) => {
      const newApps =
        state.apps?.map((app) =>
          app.appSlug === appSlug ? { ...app, selectedVersion: version } : app,
        ) || null;
      if (newApps) {
        localStorage.setItem("apps", JSON.stringify(newApps));
      }
      return { apps: newApps };
    });
  },

  setCurrentApp: (app) => set({ currentApp: app }),
  setCurrentVersion: (version) => set({ currentVersion: version }),
  setRunStatus: (status) => set({ runStatus: status }),
  setOutputs: (newOutputs) => set({ outputs: newOutputs }),
  setAsk: (ask) => set({ ask }),

  getCurrentApp: (appSlug) => {
    const state = get();
    if (!appSlug || !state.apps) return null;
    return state.apps.find((app) => app.appSlug === appSlug) || null;
  },
  setRunId: (runId) => set({ runId }),
  setAutoScroll: (autoScroll) => set({ autoScroll }),
}));

// Selector hooks for better performance
export const useApps = () => useStore((state) => state.apps);
export const useApiKey = () => useStore((state) => state.apiKey);
export const useCurrentApp = () => useStore((state) => state.currentApp);
export const useCurrentVersion = () =>
  useStore((state) => state.currentVersion);
export const useRunStatus = () => useStore((state) => state.runStatus);
export const useOutputs = () => useStore((state) => state.outputs);
export const useAsk = () => useStore((state) => state.ask);
export const useRunId = () => useStore((state) => state.runId);
export const useOutputRef = () => useStore((state) => state.outputRef);
export const useAutoScroll = () => useStore((state) => state.autoScroll);
// Action hooks
export const useStoreActions = () => ({
  updateApps: useStore((state) => state.updateApps),
  updateApiKey: useStore((state) => state.updateApiKey),
  updateApp: useStore((state) => state.updateApp),
  updateVersion: useStore((state) => state.updateVersion),
  setCurrentApp: useStore((state) => state.setCurrentApp),
  setCurrentVersion: useStore((state) => state.setCurrentVersion),
  setRunStatus: useStore((state) => state.setRunStatus),
  setOutputs: useStore((state) => state.setOutputs),
  setAsk: useStore((state) => state.setAsk),
  getCurrentApp: useStore((state) => state.getCurrentApp),
  setRunId: useStore((state) => state.setRunId),
  setAutoScroll: useStore((state) => state.setAutoScroll),
});
