"use client";

import { KeyInput } from "@/components/key-input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WordApp } from "@/components/word-app";
import { useLocal } from "@/hooks/useLocal";
import { cn } from "@/lib/utils";
import { AppWithVersions } from "@/types/types";
import Link from "next/link";
import { useLayoutEffect, useState } from "react";

export default function Home() {
  const { apps, updateApps, updateApiKey, apiKey } = useLocal();
  const [openedApp, setOpenedApp] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useLayoutEffect(() => {
    setIsClient(true);
  }, []);

  const updateApp = (app: AppWithVersions) => {
    const updatedApps = apps?.map((currentApp) =>
      currentApp.appSlug === app.appSlug ? app : currentApp,
    );
    updateApps(updatedApps ?? null);
  };

  if (!isClient) return null;

  return (
    <div className="flex min-h-screen flex-col items-center py-8">
      <div className="w-full max-w-3xl space-y-4">
        <div className="flex w-full items-start gap-4">
          <div className="flex items-center gap-2">
            {apps !== null && (
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
            <h2 className="whitespace-nowrap text-2xl font-bold">Word Apps:</h2>
          </div>
          <KeyInput
            apiKey={apiKey}
            updateApiKey={updateApiKey}
            updateApps={updateApps}
            apps={apps}
            setIsFetching={setIsFetching}
          />
        </div>
        {apps && apps.length > 0 ? (
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
        ) : (
          apps !== null && (
            <div className="flex w-full items-center justify-center py-48">
              <div className="flex max-w-sm flex-col items-center gap-4">
                <p className="text-center text-xl font-semibold">
                  No apps found.
                </p>
                <p className="text-center text-muted-foreground">
                  Visit the{" "}
                  <Link
                    className="text-blue-500 hover:underline"
                    href="https://app.wordware.ai/"
                    target="_blank"
                  >
                    Wordware dashboard
                  </Link>{" "}
                  to create an app or explore examples on the{" "}
                  <Link
                    className="text-blue-500 hover:underline"
                    href="https://app.wordware.ai/explore"
                    target="_blank"
                  >
                    Explore page
                  </Link>
                  .
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
