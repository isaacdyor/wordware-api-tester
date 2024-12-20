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

import {
  useApiKey,
  useApps,
  useBackgroundRefresh,
  useStoreActions,
} from "@/stores/store";
import { useParams } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { NavBreadcrumb } from "./nav-breadcrumb";
import { useApiKeyForm } from "@/hooks/useApiKeyForm";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const apps = useApps();
  const apiKey = useApiKey();
  const {
    updateApps,
    updateApiKey,
    setCurrentVersion,
    setCurrentAppId,
    setBackgroundRefresh,
  } = useStoreActions();
  const backgroundRefresh = useBackgroundRefresh();
  const { fetchApps } = useApiKeyForm();

  const [isClient, setIsClient] = useState(false);
  const params = useParams<{ appSlug: string }>();

  useLayoutEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    if (apiKey) {
      setBackgroundRefresh(true);
      fetchApps(apiKey);
    }
  }, [apiKey, fetchApps, setBackgroundRefresh]);

  // Sync data from local storage
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
    if (app) setCurrentAppId(app.appSlug);
    if (version) setCurrentVersion(version.version);
  }, [
    params.appSlug,
    setCurrentAppId,
    setCurrentVersion,
    updateApiKey,
    updateApps,
  ]);

  if (!isClient) return null;

  return (
    <div className="flex h-screen flex-col">
      <div className="flex h-14 items-center justify-between border-b px-6 py-3">
        <Logo className="size-32" />
        <div className="flex items-center justify-end gap-2">
          <KeyInput />
          <ThemeToggle />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 overflow-y-auto border-r">
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
                          backgroundRefresh && "animate-pulse bg-yellow-500",
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {backgroundRefresh
                        ? "Checking for updates..."
                        : "All apps are up to date"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <NavBreadcrumb />
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
