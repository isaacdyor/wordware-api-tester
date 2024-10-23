import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Braces, Table } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function Output({
  runOutputs,
}: {
  runOutputs: Record<string, unknown>;
}) {
  const [jsonView, setJsonView] = useState(false);

  return (
    <Card className="w-full">
      <CardContent className="pt-6 relative">
        <div className="max-h-[500px] overflow-y-scroll [scrollbar-width:none]">
          {jsonView ? (
            <pre className="text-muted-foreground whitespace-pre-wrap break-words text-sm">
              {JSON.stringify(runOutputs, null, 2)}
            </pre>
          ) : (
            <div className="space-y-8">
              {Object.entries(runOutputs).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-2">
                  <span className="font-semibold">{key}:</span>
                  <pre className="text-muted-foreground whitespace-pre-wrap break-words text-sm">
                    {typeof value === "object"
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setJsonView(!jsonView)}
              >
                {jsonView ? (
                  <Table className="h-4 w-4" />
                ) : (
                  <Braces className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{jsonView ? "Formatted View" : "JSON View"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
