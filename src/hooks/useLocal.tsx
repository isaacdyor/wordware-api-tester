import { AppWithVersions } from "@/actions/actions";
import { useState, useEffect } from "react";

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

  const updateApps = (newApps: AppWithVersions[]) => {
    setApps(newApps);
    localStorage.setItem("apps", JSON.stringify(newApps));
    console.log("Updated apps", newApps);
  };

  const updateApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem("apiKey", newApiKey);
  };

  return { apps, updateApps, apiKey, updateApiKey };
};
