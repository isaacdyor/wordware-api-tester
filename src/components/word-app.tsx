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
import type { AppWithVersions, Run } from "@/types/types";

import { ChevronDown, Info } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { Output } from "./output";
import { WordAppForm } from "./word-app-form";

interface WordAppProps {
  app: AppWithVersions;
  isOpened: boolean;
  toggleOpen: () => void;
  updateApp: (newApp: AppWithVersions) => void;
}

export function WordApp({
  app,
  isOpened,
  toggleOpen,
  updateApp,
}: WordAppProps) {
  const [runOutput, setRunOutput] = useState<Run | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentVersion = app.versions.find(
    (v) => v.version === app.selectedVersion,
  );

  const sortedVersions = app.versions.sort((a, b) => {
    const [aMajor, aMinor] = a.version.split(".").map(Number);
    const [bMajor, bMinor] = b.version.split(".").map(Number);
    if (bMajor !== aMajor) return bMajor - aMajor;
    return bMinor - aMinor;
  });

  // smooth open/close
  useLayoutEffect(() => {
    if (contentRef.current) {
      if (isOpened) {
        contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
      } else {
        contentRef.current.style.maxHeight = "0px";
      }
    }
  });

  return (
    <li className="overflow-hidden rounded-lg border">
      <div
        className="flex cursor-pointer items-center justify-between bg-muted p-4 hover:bg-muted/80"
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">
            {currentVersion?.title || app.appSlug}
          </h3>
          <TooltipProvider delayDuration={0}>
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

        <ChevronDown
          className={`transform transition-transform duration-300 ease-out ${
            isOpened ? "rotate-180" : ""
          }`}
        />
      </div>
      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-300 ease-out"
      >
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
                  onValueChange={(version) =>
                    updateApp({ ...app, selectedVersion: version })
                  }
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

            <WordAppForm
              app={app}
              currentVersion={currentVersion}
              setRunOutput={setRunOutput}
              updateApp={updateApp}
              runOutput={runOutput}
            />

            {runOutput && (
              <div className="mt-4">
                {runOutput.status === "COMPLETE" && runOutput.outputs && (
                  <Output runOutputs={runOutput.outputs} />
                )}
                {runOutput.status === "ERROR" && runOutput.errors && (
                  <div>
                    <h5 className="font-semibold text-destructive">Errors:</h5>
                    <ul className="mt-2 list-disc pl-5">
                      {runOutput.errors.map((error, index) => (
                        <li key={index} className="text-destructive">
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
