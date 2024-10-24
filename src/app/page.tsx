"use client";

import { KeyInput } from "@/components/key-input";
import { WordApp } from "@/components/word-app";
import { useLocal } from "@/hooks/useLocal";
import { cn } from "@/lib/utils";
import { AppWithVersions } from "@/types/types";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Home() {
  const { apps, updateApps, updateApiKey } = useLocal();
  const [openedApp, setOpenedApp] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const { apiKey } = useLocal();

  const updateApp = (app: AppWithVersions) => {
    const updatedApps = apps.map((currentApp) =>
      currentApp.appSlug === app.appSlug ? app : currentApp,
    );
    updateApps(updatedApps);
  };

  return (
    <div className="flex min-h-screen flex-col items-center py-8">
      <div className="w-full max-w-2xl">
        {apps.length > 0 && (
          <div className="space-y-4">
            <div className="flex w-full items-center gap-4">
              <div className="flex items-center gap-2">
                {apiKey && (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full bg-green-500",
                            isFetching && "animate-pulse bg-yellow-500",
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {isFetching
                          ? "Checking for new versions..."
                          : "All apps are up to date"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <h2 className="whitespace-nowrap text-2xl font-bold">
                  Word Apps:
                </h2>
              </div>
              <KeyInput
                updateApiKey={updateApiKey}
                updateApps={updateApps}
                apps={apps}
                setIsFetching={setIsFetching}
              />
            </div>

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
