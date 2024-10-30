import { create } from "zustand";
import { AppWithVersions, Ask, VersionWithRuns, Output } from "@/types/types";

interface StoreState {
  apps: AppWithVersions[] | null;
  apiKey: string | null;
  currentAppId: string | null;
  currentVersion: string | null;
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
  setCurrentAppId: (appId: string | null) => void;
  setCurrentVersion: (version: string | null) => void;
  setRunStatus: (
    status: "COMPLETE" | "RUNNING" | "AWAITING_INPUT" | "ERROR" | null,
  ) => void;
  setOutputs: (newOutputs: Output[]) => void;
  setAsk: (ask: Ask | null) => void;
  setRunId: (runId: string | null) => void;
  setAutoScroll: (autoScroll: boolean) => void;

  // Selectors
  getCurrentApp: () => AppWithVersions | null;
  getCurrentVersion: () => VersionWithRuns | null;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  apps: null,
  apiKey: null,
  currentAppId: null,
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

  setCurrentAppId: (appId) => set({ currentAppId: appId }),
  setCurrentVersion: (version) => set({ currentVersion: version }),
  setRunStatus: (status) => set({ runStatus: status }),
  setOutputs: (newOutputs) => set({ outputs: newOutputs }),
  setAsk: (ask) => set({ ask }),
  setRunId: (runId) => set({ runId }),
  setAutoScroll: (autoScroll) => set({ autoScroll }),

  // Selectors
  getCurrentApp: () => {
    const { apps, currentAppId } = get();
    if (!currentAppId || !apps) return null;
    return apps.find((app) => app.appSlug === currentAppId) || null;
  },

  getCurrentVersion: () => {
    const { currentVersion } = get();
    const currentApp = get().getCurrentApp();
    if (!currentVersion || !currentApp?.versions) return null;
    return (
      currentApp.versions.find(
        (version) => version.version === currentVersion,
      ) || null
    );
  },
}));

// Selector hooks
export const useApps = () => useStore((state) => state.apps);
export const useApiKey = () => useStore((state) => state.apiKey);
export const useCurrentAppId = () => useStore((state) => state.currentAppId);
export const useCurrentVersion = () =>
  useStore((state) => state.getCurrentVersion());
export const useCurrentApp = () => useStore((state) => state.getCurrentApp());
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
  setCurrentAppId: useStore((state) => state.setCurrentAppId),
  setCurrentVersion: useStore((state) => state.setCurrentVersion),
  setRunStatus: useStore((state) => state.setRunStatus),
  setOutputs: useStore((state) => state.setOutputs),
  setAsk: useStore((state) => state.setAsk),
  setRunId: useStore((state) => state.setRunId),
  setAutoScroll: useStore((state) => state.setAutoScroll),
});
