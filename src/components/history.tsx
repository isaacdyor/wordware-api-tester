import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VersionWithRuns } from "@/types/types";
import { History } from "lucide-react";

export function RunHistory({
  currentVersion,
}: {
  currentVersion: VersionWithRuns;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <History className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Run history</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {currentVersion.runs.length > 0 ? (
                currentVersion.runs.map((run) => (
                  <DropdownMenuItem key={run.startTime}>
                    {run.startTime
                      ? new Date(run.startTime).toLocaleString()
                      : "N/A"}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No runs yet</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>View history</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
