import { create } from "zustand";
import { AppWithVersions, VersionWithRuns } from "@/types/types";

interface StoreState {
  apps: AppWithVersions[] | null;
  apiKey: string;
  currentApp: AppWithVersions | null;
  currentVersion: VersionWithRuns | null;
  runStatus: "COMPLETE" | "RUNNING" | "AWAITING_INPUT" | "ERROR" | null;
  outputs: Record<string, string>;

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
  setOutputs: (outputs: Record<string, string>) => void;
  getCurrentApp: (appSlug: string | null) => AppWithVersions | null;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  apps: (() => {
    // Initialize from localStorage if in browser environment
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("apps");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  })(),
  apiKey:
    typeof window !== "undefined" ? localStorage.getItem("apiKey") || "" : "",
  currentApp: null,
  currentVersion: null,
  runStatus: null,
  outputs: {},

  // Actions
  updateApps: (newApps) => {
    set({ apps: newApps });
    if (typeof window !== "undefined") {
      localStorage.setItem("apps", JSON.stringify(newApps));
    }
  },

  updateApiKey: (newApiKey) => {
    set({ apiKey: newApiKey });
    if (typeof window !== "undefined") {
      localStorage.setItem("apiKey", newApiKey);
    }
  },

  updateApp: (updatedApp) => {
    set((state) => {
      const newApps =
        state.apps?.map((app) =>
          app.appSlug === updatedApp.appSlug ? updatedApp : app,
        ) || null;

      if (typeof window !== "undefined") {
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

      if (typeof window !== "undefined") {
        localStorage.setItem("apps", JSON.stringify(newApps));
      }

      return { apps: newApps };
    });
  },

  setCurrentApp: (app) => set({ currentApp: app }),
  setCurrentVersion: (version) => set({ currentVersion: version }),
  setRunStatus: (status) => set({ runStatus: status }),
  setOutputs: (outputs) => set({ outputs }),

  getCurrentApp: (appSlug) => {
    const state = get();
    if (!appSlug || !state.apps) return null;
    return state.apps.find((app) => app.appSlug === appSlug) || null;
  },
}));

// Selector hooks for better performance
export const useApps = () => useStore((state) => state.apps);
export const useApiKey = () => useStore((state) => state.apiKey);
export const useCurrentApp = () => useStore((state) => state.currentApp);
export const useCurrentVersion = () =>
  useStore((state) => state.currentVersion);
export const useRunStatus = () => useStore((state) => state.runStatus);
export const useOutputs = () => useStore((state) => state.outputs);

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
  getCurrentApp: useStore((state) => state.getCurrentApp),
});
