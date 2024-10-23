import { AppWithVersions } from "@/actions/actions";
import { useState, useEffect, useCallback } from "react";

export const useLocal = () => {
  const [apps, setApps] = useState<AppWithVersions[]>([]);
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    const storedApps = localStorage.getItem("apps");
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApps) {
      setApps(JSON.parse(storedApps));
    }
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const updateApps = useCallback((newApps: AppWithVersions[]) => {
    setApps(newApps);
    localStorage.setItem("apps", JSON.stringify(newApps));
  }, []);

  const updateApiKey = useCallback((newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem("apiKey", newApiKey);
  }, []);

  return { apps, updateApps, apiKey, updateApiKey };
};
