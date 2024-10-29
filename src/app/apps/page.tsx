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

export default function AppsPage() {
  const { apps, updateApps, updateApiKey, apiKey } = useLocal();
  const [openedApp, setOpenedApp] = useState<string | null>(null);

  return (
    <>
      {apps && apps.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => {
            const key = `${app.orgSlug}/${app.appSlug}`;
            return (
              <WordApp
                key={key}
                app={app}
                isOpened={openedApp === key}
                toggleOpen={() => setOpenedApp(openedApp === key ? null : key)}
                updateApp={updateApps}
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
    </>
  );
}
