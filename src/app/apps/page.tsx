"use client";

import KeyDialog from "@/components/key-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { WordAppCard } from "@/components/word-app-card";
import { useApiKey, useApps, useAppsLoading } from "@/stores/store";
import Link from "next/link";

export default function AppsPage() {
  const apps = useApps();
  const apiKey = useApiKey();
  const appsLoading = useAppsLoading();

  return apiKey ? (
    <>
      {appsLoading ? (
        <ul className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-[196px]" />
          ))}
        </ul>
      ) : apps && apps.length > 0 ? (
        <ul className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => {
            return (
              <WordAppCard key={`${app.orgSlug}/${app.appSlug}`} app={app} />
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
    </>
  ) : (
    <KeyDialog />
  );
}
