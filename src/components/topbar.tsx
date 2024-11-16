"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppWithVersions, Version } from "@/types/types";
import { KeyInput } from "./key-input";
import { ThemeToggle } from "./theme-toggle";

import { useApiKeyForm } from "@/hooks/useApiKeyForm";
import {
  useApiKey,
  useApps,
  useBackgroundRefresh,
  useStoreActions,
} from "@/stores/store";
import { useParams } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

export function Topbar({
  children,
}: {
  children: React.ReactNode;
  topbarContent?: React.ReactNode;
}) {
  const apiKey = useApiKey();
  const {
    updateApps,
    updateApiKey,
    setCurrentVersion,
    setCurrentAppId,
    setBackgroundRefresh,
  } = useStoreActions();
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
    <>
      <div className="sticky top-0 z-20 flex h-10 w-full items-center justify-between bg-sidebar p-2">
        <SidebarTrigger className="size-4 bg-transparent" />
        <div className="flex items-center justify-end gap-2">
          <KeyInput />
          <ThemeToggle />
        </div>
      </div>
      <div className="bg-sidebar">
        <div className="border-t bg-background p-4 md:rounded-tl-lg md:border-l">
          {children}
        </div>
      </div>
    </>
  );
}
