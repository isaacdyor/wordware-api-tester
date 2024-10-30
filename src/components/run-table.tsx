import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { timeAgo } from "@/lib/utils";
import { useLocalStore } from "@/stores/useLocalStore";
import { RunInput, RunWithInputs } from "@/types/types";
import { useParams } from "next/navigation";

interface RunTableProps {
  setInputValues: (inputValues: Record<string, string>) => void;
  setOutputs: (outputs: Record<string, string>) => void;
  setTab: (tab: "playground" | "api" | "previous-runs") => void;
}

export function RunTable({
  setInputValues,
  setOutputs,
  setTab,
}: RunTableProps) {
  const { apps } = useLocalStore();
  const params = useParams<{ appSlug: string }>();
  const currentApp = apps?.find((app) => app.appSlug === params.appSlug);
  const currentVersion = currentApp?.versions.find(
    (version) => version.version === currentApp?.selectedVersion,
  );

  const sortedRuns = [...(currentVersion?.runs || [])].sort((a, b) => {
    return (
      new Date(b.runTime || 0).getTime() - new Date(a.runTime || 0).getTime()
    );
  });

  const handleSelect = (run: RunWithInputs) => {
    if (!run.inputs) return;

    const inputValues = run.inputs.reduce(
      (acc: Record<string, string>, input: RunInput) => {
        acc[input.name] = input.value;
        return acc;
      },
      {},
    );
    setOutputs(run.outputs as Record<string, string>);
    setInputValues(inputValues);
    setTab("playground");
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRuns.map((run) => (
            <TableRow
              key={run.runTime}
              onClick={() => handleSelect(run)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="font-medium">
                {timeAgo(run.runTime ?? new Date())}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
