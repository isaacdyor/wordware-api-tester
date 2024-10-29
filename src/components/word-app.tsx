"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AppWithVersions } from "@/types/types";
import { Info } from "lucide-react";

interface WordAppProps {
  app: AppWithVersions;
}

export function WordApp({ app }: WordAppProps) {
  const currentVersion = app.versions.find(
    (v) => v.version === app.selectedVersion,
  );

  const sortedVersions = app.versions.sort((a, b) => {
    const [aMajor, aMinor] = a.version.split(".").map(Number);
    const [bMajor, bMinor] = b.version.split(".").map(Number);
    if (bMajor !== aMajor) return bMajor - aMajor;
    return bMinor - aMinor;
  });

  return (
    <li className="overflow-hidden rounded-lg border">
      <div className="flex cursor-pointer items-center justify-between bg-muted p-4 hover:bg-muted/80">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">
            {currentVersion?.title || app.appSlug}
          </h3>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent
                className="max-w-xs border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <p>
                  <strong>Org Slug:</strong> {app.orgSlug}
                </p>
                <p>
                  <strong>App Slug:</strong> {app.appSlug}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {app.created ? new Date(app.created).toLocaleString() : "N/A"}
                </p>
                <p>
                  <strong>Updated:</strong>{" "}
                  {app.lastUpdated
                    ? new Date(app.lastUpdated).toLocaleString()
                    : "N/A"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="overflow-hidden transition-[max-height] duration-300 ease-out">
        {currentVersion && (
          <div className="space-y-4 p-4">
            {currentVersion.description && (
              <p className="text-sm text-muted-foreground">
                {currentVersion.description}
              </p>
            )}

            <div className="flex flex-col gap-2 text-sm">
              <div className="col-span-2">
                <Label>Version</Label>
                <Select
                  value={app.selectedVersion}
                  // onValueChange={(version) =>
                  //   updateApp({ ...app, selectedVersion: version })
                  // }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedVersions.map((version) => (
                      <SelectItem key={version.version} value={version.version}>
                        {version.version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
