"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AppWithVersions } from "@/types/types";
import { Info } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

interface WordAppCardProps {
  app: AppWithVersions;
}

export function WordAppCard({ app }: WordAppCardProps) {
  const currentVersion = app.versions[0];

  return (
    <li className="h-full">
      <Link href={`/apps/${app.appSlug}`} className="block h-full">
        <Card className="flex h-full flex-col justify-between hover:border-muted-foreground/50 hover:bg-secondary/20">
          <div className="flex h-full flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="line-clamp-1">{currentVersion.title}</p>
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
                          {app.created
                            ? new Date(app.created).toLocaleString()
                            : "N/A"}
                        </p>
                        <p>
                          <strong>Latest Version:</strong>{" "}
                          {app.versions[0].version}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <Badge variant="secondary">{app.visibility}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {currentVersion.description}
              </p>
            </CardContent>
          </div>
          <CardFooter className="text-mute flex items-center gap-2 text-xs font-medium">
            <span className="font-semibold">Last Updated:</span>
            {timeAgo(currentVersion.created)}
          </CardFooter>
        </Card>
      </Link>
    </li>
  );
}
