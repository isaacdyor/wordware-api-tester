import { startRun } from "@/actions/actions";
import { useLocalStore } from "@/stores/useLocalStore";
import { useRef } from "react";

type RunStatus = "COMPLETE" | "RUNNING" | "ERROR" | null;

interface UseStreamProps {
  setOutputs: (outputs: Record<string, string>) => void;
  setRunStatus: (runStatus: RunStatus) => void;
}

export function useStream({ setOutputs, setRunStatus }: UseStreamProps) {
  const latestOutputsRef = useRef<Record<string, string>>({});
  const { apiKey, updateApp, currentApp, currentVersion } = useLocalStore();

  const streamRunOutput = async (
    runId: string,
    values: Record<string, unknown>,
  ) => {
    if (!currentApp) throw new Error("No current app");
    const response = await fetch(`/api/stream/${runId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let jsonBuffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        setRunStatus("COMPLETE");
        const inputs = Object.entries(values).map(([name, value]) => {
          const input = currentVersion?.inputs.find((i) => i.name === name);
          if (
            input &&
            (input.type === "image" ||
              input.type === "audio" ||
              input.type === "file")
          ) {
            const fileValue = value as { url: string; fileName: string };
            return {
              name,
              value: JSON.stringify({
                url: fileValue.url,
                fileName: fileValue.fileName,
                type: input.type,
              }),
            };
          }
          return {
            name,
            value: String(value),
          };
        });

        const run = {
          outputs: latestOutputsRef.current,
          inputs,
          runTime: new Date().toISOString(),
        };

        const updatedApp = {
          ...currentApp,
          versions: currentApp?.versions.map((v) =>
            v.version === currentVersion?.version
              ? { ...v, runs: [...(v.runs || []), run] }
              : v,
          ),
        };

        updateApp(updatedApp);
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          jsonBuffer += line.slice(6);
          if (jsonBuffer.trim().endsWith("}")) {
            try {
              const data = JSON.parse(jsonBuffer);

              latestOutputsRef.current = {
                ...latestOutputsRef.current,
                [data.path]:
                  (latestOutputsRef.current[data.path] || "") + data.content,
              };

              setOutputs(latestOutputsRef.current);

              jsonBuffer = "";
            } catch (error) {
              console.error("Not yet complete JSON", error);
            }
          }
        }
      }
    }
  };

  const handleStartRun = async (values: Record<string, unknown>) => {
    if (!currentApp) throw new Error("No current app");
    try {
      setRunStatus("RUNNING");
      setOutputs({});
      latestOutputsRef.current = {};
      if (!currentVersion) throw new Error("Selected version not found");

      const formattedValues = currentVersion.inputs.reduce(
        (acc, input) => {
          if (
            input.type === "image" ||
            input.type === "audio" ||
            input.type === "file"
          ) {
            const fileValue = values[input.name] as {
              url: string;
              fileName: string;
            };
            acc[input.name] = {
              type: input.type,
              [`${input.type}_url`]: fileValue.url,
              file_name: fileValue.fileName,
            };
          } else {
            acc[input.name] = values[input.name] as string;
          }
          return acc;
        },
        {} as Record<
          string,
          | string
          | {
              type: string;
              image_url?: string;
              audio_url?: string;
              file_url?: string;
              file_name: string;
            }
        >,
      );

      const runId = await startRun(
        apiKey,
        currentVersion.version,
        formattedValues,
        currentApp.orgSlug,
        currentApp.appSlug,
      );
      streamRunOutput(runId, values);
    } catch (error) {
      console.error("Error running app:", error);
      setRunStatus("ERROR");
    }
  };

  return {
    handleStartRun,
  };
}
