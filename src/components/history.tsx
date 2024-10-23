import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input, RunWithInputs, VersionWithRuns } from "@/types/types";

import { History } from "lucide-react";

export function RunHistory({
  currentVersion,
  setInputValues,
}: {
  currentVersion: VersionWithRuns;
  setInputValues: (values: Record<string, string>) => void;
}) {
  const onClick = (run: RunWithInputs) => {
    if (!run.inputs) return;

    const inputValues = run.inputs.reduce(
      (acc: Record<string, string>, input: Input) => {
        acc[input.name] = input.value;
        return acc;
      },
      {}
    );

    setInputValues(inputValues);
  };

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
                  <DropdownMenuItem
                    key={run.startTime}
                    onClick={() => onClick(run)}
                  >
                    <span className="flex-1">
                      {run.startTime
                        ? new Date(run.startTime).toLocaleString()
                        : "N/A"}
                    </span>
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
