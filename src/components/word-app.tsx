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
import { Card, CardTitle, CardHeader, CardContent } from "./ui/card";

interface WordAppProps {
  app: AppWithVersions;
}

export function WordApp({ app }: WordAppProps) {
  const currentVersion = app.versions[0];

  return (
    <li className="h-full">
      <Link href={`/apps/${app.appSlug}`} className="block h-full">
        <Card className="h-full hover:border-muted-foreground/50 hover:bg-secondary/20">
          <CardHeader>
            <CardTitle>{currentVersion.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {currentVersion.description}
            </p>
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}
