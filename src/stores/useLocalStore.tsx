import { AppWithVersions, Version } from "@/types/types";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const useLocalStore = () => {
  const [apps, setApps] = useState<AppWithVersions[] | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [currentApp, setCurrentApp] = useState<AppWithVersions | null>(null);
  const [currentVersion, setCurrentVersion] = useState<Version | null>(null);

  const params = useParams<{ appSlug: string }>();

  // Initial load from localStorage - only for apps and apiKey
  useEffect(() => {
    const storedApps = localStorage.getItem("apps");
    const parsedApps = storedApps ? JSON.parse(storedApps) : null;
    const storedApiKey = localStorage.getItem("apiKey");

    const app = parsedApps?.find(
      (app: AppWithVersions) => app.appSlug === params.appSlug,
    );

    const version = app?.versions.find(
      (version: Version) => version.version === currentVersion?.version,
    );

    console.log(version);

    if (storedApps) setApps(parsedApps);
    if (storedApiKey) setApiKey(storedApiKey);
    if (app) setCurrentApp(app);
    if (version) setCurrentVersion(version);
  }, [currentVersion?.version, params.appSlug]);

  const updateApps = useCallback((newApps: AppWithVersions[] | null) => {
    setApps(newApps);
    localStorage.setItem("apps", JSON.stringify(newApps));
  }, []);

  const updateApiKey = useCallback((newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem("apiKey", newApiKey);
  }, []);

  const updateApp = useCallback((updatedApp: AppWithVersions) => {
    setApps((prevApps) => {
      const newApps =
        prevApps?.map((app) =>
          app.appSlug === updatedApp.appSlug ? updatedApp : app,
        ) || null;
      localStorage.setItem("apps", JSON.stringify(newApps));
      return newApps;
    });
  }, []);

  const updateVersion = useCallback((appSlug: string, version: string) => {
    setApps((prevApps) => {
      const newApps =
        prevApps?.map((app) =>
          app.appSlug === appSlug ? { ...app, selectedVersion: version } : app,
        ) || null;
      localStorage.setItem("apps", JSON.stringify(newApps));
      return newApps;
    });
  }, []);

  // Helper function to get current app based on appSlug
  const getCurrentApp = useCallback(
    (appSlug: string | null) => {
      if (!appSlug || !apps) return null;
      return apps.find((app) => app.appSlug === appSlug) || null;
    },
    [apps],
  );

  return {
    apps,
    apiKey,
    currentApp,
    currentVersion,
    getCurrentApp,
    updateApps,
    updateApiKey,
    updateApp,
    updateVersion,
    setCurrentApp,
    setCurrentVersion,
  };
};

// Optional: Create individual hooks for better performance
export const useApps = () => useLocalStore().apps;
export const useApiKey = () => useLocalStore().apiKey;
export const useCurrentApp = () => useLocalStore().currentApp;
export const useCurrentVersion = () => useLocalStore().currentVersion;
