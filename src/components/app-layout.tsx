"use client";

import { KeyInput } from "@/components/key-input";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AppWithVersions, Version } from "@/types/types";
import { Plus } from "lucide-react";
import Link from "next/link";

import { useParams } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { NavBreadcrumb } from "./nav-breadcrumb";
import { useApiKey, useApps, useStoreActions } from "@/stores/store";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const apps = useApps();
  const { updateApps, updateApiKey, setCurrentVersion, setCurrentApp } =
    useStoreActions();
  const apiKey = useApiKey();

  const [isFetching, setIsFetching] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const params = useParams<{ appSlug: string }>();

  useLayoutEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const storedApps = localStorage.getItem("apps");
    const parsedApps = storedApps ? JSON.parse(storedApps) : null;
    const storedApiKey = localStorage.getItem("apiKey");

    const app = parsedApps?.find(
      (app: AppWithVersions) => app.appSlug === params.appSlug,
    );

    const version = app?.versions.find(
      (version: Version) => version.version === app?.selectedVersion,
    );

    if (storedApps) updateApps(parsedApps);
    if (storedApiKey) updateApiKey(storedApiKey);
    if (app) setCurrentApp(app);
    if (version) setCurrentVersion(version);
  }, [
    params.appSlug,
    setCurrentApp,
    setCurrentVersion,
    updateApiKey,
    updateApps,
  ]);

  const appSlug = params.appSlug;
  const app = apps?.find((app) => {
    return app.appSlug === appSlug;
  });

  const updateApp = (app: AppWithVersions) => {
    const updatedApps = apps?.map((currentApp) =>
      currentApp.appSlug === app.appSlug ? app : currentApp,
    );
    updateApps(updatedApps ?? null);
  };

  if (!isClient) return null;

  return (
    <div className="flex h-screen flex-col">
      <div className="flex h-14 items-center justify-between border-b px-6 py-3">
        <Logo className="size-32" />
        <div className="flex items-center justify-end gap-2">
          <KeyInput
            apiKey={apiKey}
            updateApiKey={updateApiKey}
            updateApps={updateApps}
            apps={apps}
            setIsFetching={setIsFetching}
          />
          <ThemeToggle />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 overflow-y-auto border-r">
          <div className="mb-2 border-b p-2">
            <Link
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "flex w-full gap-2",
              )}
              href="https://app.wordware.ai/"
            >
              <Plus /> Create App
            </Link>
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-4 border-b px-4 py-1.5">
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
                        ? "Checking for updates..."
                        : "All apps are up to date"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <NavBreadcrumb app={app ?? null} updateApp={updateApp} />
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
