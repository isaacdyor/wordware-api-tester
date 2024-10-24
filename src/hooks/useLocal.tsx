import { AppWithVersions } from "@/types/types";
import { useCallback, useEffect, useState } from "react";

export const useLocal = () => {
  const [apps, setApps] = useState<AppWithVersions[] | null>(null);
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

  const updateApps = useCallback((newApps: AppWithVersions[] | null) => {
    setApps(newApps);
    localStorage.setItem("apps", JSON.stringify(newApps));
  }, []);

  const updateApiKey = useCallback((newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem("apiKey", newApiKey);
  }, []);

  return { apps, updateApps, apiKey, updateApiKey };
};
