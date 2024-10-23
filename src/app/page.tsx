"use client";

import type { AppWithVersions } from "@/actions/actions";
import { fetchAppVersions, fetchWordApps } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WordApp } from "@/components/word-app";
import { useLocal } from "@/hooks/useLocal";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apps, updateApps, apiKey, updateApiKey } = useLocal();

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) updateApiKey(storedApiKey);
  }, [updateApiKey]);

  useEffect(() => {
    if (apiKey) localStorage.setItem("apiKey", apiKey);
  }, [apiKey]);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedApps = await fetchWordApps(apiKey);
      const appsWithVersions: AppWithVersions[] = [];

      for (const app of fetchedApps) {
        try {
          const versions = await fetchAppVersions(
            apiKey,
            app.orgSlug,
            app.appSlug
          );

          // Sort versions in descending order
          versions.sort((a, b) => {
            const versionA = a.version.split(".").map(Number);
            const versionB = b.version.split(".").map(Number);
            for (
              let i = 0;
              i < Math.max(versionA.length, versionB.length);
              i++
            ) {
              const numA = versionA[i] || 0;
              const numB = versionB[i] || 0;
              if (numA > numB) return -1;
              if (numA < numB) return 1;
            }
            return 0;
          });

          appsWithVersions.push({
            ...app,
            versions,
            selectedVersion: versions[0]?.version || "",
          });
        } catch (versionError) {
          console.error(
            `Error fetching versions for ${app.appSlug}:`,
            versionError
          );
        }
      }

      // Sort apps by lastUpdated in descending order
      appsWithVersions.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );

      updateApps(appsWithVersions);
    } catch (error) {
      console.error("Failed to fetch apps:", error);
      setError(
        "Failed to fetch apps. Please check your API key and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl space-y-4">
        <div>
          <Label htmlFor="apiKey">API Key</Label>
          <div className="flex items-center gap-2">
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => updateApiKey(e.target.value)}
              placeholder="Enter your API key"
            />
            <Button size="icon" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCcw className={isLoading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        {error && <p className="text-destructive">{error}</p>}

        {apps.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Word Apps:</h2>
            <ul className="space-y-2">
              {apps.map((app) => (
                <WordApp
                  key={`${app.orgSlug}/${app.appSlug}/${app.selectedVersion}`}
                  app={app}
                  apiKey={apiKey}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
