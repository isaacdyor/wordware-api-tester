"use client";

import { AppWithVersions } from "@/actions/actions";
import { KeyInput } from "@/components/key-input";
import { WordApp } from "@/components/word-app";
import { useLocal } from "@/hooks/useLocal";
import { useState } from "react";

export default function Home() {
  const { apps, updateApps, apiKey, updateApiKey } = useLocal();
  const [openedApp, setOpenedApp] = useState<string | null>(null);

  const updateApp = (app: AppWithVersions) => {
    const updatedApps = apps.map((currentApp) =>
      currentApp.appSlug === app.appSlug
        ? {
            ...currentApp,
            selectedVersion: app.selectedVersion,
          }
        : currentApp
    );
    updateApps(updatedApps);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-2xl space-y-4">
        <KeyInput
          apiKey={apiKey}
          updateApiKey={updateApiKey}
          updateApps={updateApps}
        />

        {apps.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Word Apps:</h2>
            <ul className="space-y-2">
              {apps.map((app) => {
                const key = `${app.orgSlug}/${app.appSlug}`;
                return (
                  <WordApp
                    key={key}
                    app={app}
                    isOpened={openedApp === key}
                    toggleOpen={() =>
                      setOpenedApp(openedApp === key ? null : key)
                    }
                    apiKey={apiKey}
                    updateApp={updateApp}
                  />
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
