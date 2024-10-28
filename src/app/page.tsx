"use client";

import { KeyInput } from "@/components/key-input";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Plus } from "lucide-react";
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
    <div className="flex h-screen flex-col">
      <div className="flex h-14 items-center justify-between border-b p-3">
        <Logo className="size-32" />
        <div className="flex items-center gap-2">
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
      <div className="flex h-full">
        <div className="w-64 border-r">
          <div className="mb-2 border-b p-2">
            <Link
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex w-full gap-2",
              )}
              href="https://app.wordware.ai/"
            >
              <Plus /> Create App
            </Link>
          </div>
        </div>
        <div className="flex-1 border-b">
          <div className="flex w-full items-start gap-4 border-b p-2">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
