import { startRun } from "@/actions/actions";
import {
  useApiKey,
  useCurrentApp,
  useCurrentVersion,
  useOutputRef,
  useStoreActions,
} from "@/stores/store";
import { AskSchema, VersionWithRuns } from "@/types/types";

export function useStream() {
  const outputRef = useOutputRef();
  const { setAsk, setAutoScroll } = useStoreActions();

  const { updateApp, setRunStatus, setOutputs, setRunId } = useStoreActions();
  const apiKey = useApiKey();
  const currentApp = useCurrentApp();
  const currentVersion = useCurrentVersion();

  const streamRunOutput = async (
    runId: string,
    values: Record<string, unknown>,
  ) => {
    if (!currentApp) throw new Error("No current app");
    let processPromise: Promise<void> | null = null;

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
        // Wait for any in-flight chunk processing to complete
        if (processPromise) {
          await processPromise;
        }

        // Double check after a small delay to ensure everything is processed
        await new Promise((resolve) => setTimeout(resolve, 50));

        if (outputRef.current.length === 0) {
          console.warn("Stream ended with no output");
          setRunStatus("ERROR");
          break;
        }

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
          outputs: outputRef.current,
          inputs,
          runTime: new Date().toISOString(),
        };

        const updatedApp = JSON.parse(JSON.stringify(currentApp));

        updatedApp.versions = updatedApp.versions.map((v: VersionWithRuns) =>
          v.version === currentVersion?.version
            ? {
                ...v,
                runs: Array.isArray(v.runs) ? [...v.runs, run] : [run],
              }
            : v,
        );

        updateApp(updatedApp);
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      processPromise = (async () => {
        try {
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              jsonBuffer += line.slice(6);
              if (jsonBuffer.trim().endsWith("}")) {
                try {
                  const data = JSON.parse(jsonBuffer);
                  if (
                    data.type === "chunk" &&
                    (!data.content || data.path === "{}")
                  ) {
                    // Skip empty chunks
                    jsonBuffer = "";
                    continue;
                  }
                  if (data.type === "ask") {
                    setRunStatus("AWAITING_INPUT");
                    const parsedData = AskSchema.parse(data);
                    setAsk(parsedData);

                    const lastOutput =
                      outputRef.current[outputRef.current.length - 1];
                    if (lastOutput) {
                      lastOutput.content += `\n\n${parsedData.content.value}\n\n`;
                      outputRef.current = [...outputRef.current];
                    } else {
                      outputRef.current = [
                        {
                          content: parsedData.content.value,
                          role: "system",
                          path: parsedData.path || "",
                        },
                      ];
                    }
                  } else {
                    const lastOutput =
                      outputRef.current[outputRef.current.length - 1];

                    if (lastOutput && lastOutput.path === (data.path || "")) {
                      lastOutput.content += data.content;
                      outputRef.current = [...outputRef.current];
                    } else {
                      outputRef.current = [
                        ...outputRef.current,
                        {
                          content: data.content,
                          role: "system",
                          path: data.path || "",
                        },
                      ];
                    }
                  }
                  setOutputs(outputRef.current);
                  jsonBuffer = "";
                } catch (error) {
                  console.error("Not yet complete JSON", error);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error processing chunk:", error);
          setRunStatus("ERROR");
        }
      })();

      // Wait for this chunk to be processed before continuing
      await processPromise;
    }
  };

  const handleStartRun = async (values: Record<string, unknown>) => {
    if (!currentApp) throw new Error("No current app");
    try {
      setRunStatus("RUNNING");
      setAutoScroll(true);
      setOutputs([]);
      outputRef.current = [];
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
        apiKey ?? "",
        currentVersion.version,
        formattedValues,
        currentApp.orgSlug,
        currentApp.appSlug,
      );
      setRunId(runId);
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
