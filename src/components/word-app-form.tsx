import { startRun } from "@/actions/actions";
import { AppWithVersions, VersionWithRuns } from "@/types/types";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useLocal } from "@/hooks/useLocal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Play } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FileUpload } from "./file-upload";
import { RunHistory } from "./history";
import { useRef } from "react";

interface WordAppFormProps {
  currentVersion: VersionWithRuns;
  setOutputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  runStatus: "COMPLETE" | "RUNNING" | "ERROR" | null;
  setRunStatus: (status: "COMPLETE" | "RUNNING" | "ERROR" | null) => void;
  app: AppWithVersions;
  updateApp: (newApp: AppWithVersions) => void;
}

export function WordAppForm({
  currentVersion,
  setOutputs,
  setRunStatus,
  app,
  updateApp,
  runStatus,
}: WordAppFormProps) {
  const { apiKey } = useLocal();
  const latestOutputsRef = useRef<Record<string, string>>({});

  const createFormSchema = () => {
    if (!currentVersion) return z.object({});

    const schemaFields = currentVersion.inputs.reduce(
      (acc, input) => {
        if (
          input.type === "image" ||
          input.type === "audio" ||
          input.type === "file"
        ) {
          acc[input.name] = z
            .object({
              url: z.string().url(),
              fileName: z.string(),
            })
            .refine((data) => data !== null, {
              message: "File is required",
            });
        } else {
          acc[input.name] = z
            .string()
            .min(1, { message: "This field is required" });
        }
        return acc;
      },
      {} as Record<string, z.ZodTypeAny>,
    );

    return z.object(schemaFields);
  };

  const form = useForm<z.infer<ReturnType<typeof createFormSchema>>>({
    resolver: zodResolver(createFormSchema()),
    defaultValues: currentVersion?.inputs.reduce(
      (acc, input) => {
        acc[input.name] =
          input.type === "image" ||
          input.type === "audio" ||
          input.type === "file"
            ? null
            : "";
        return acc;
      },
      {} as Record<string, string | null>,
    ),
  });

  type FormSchema = z.infer<ReturnType<typeof createFormSchema>>;

  const handleStartRun = async (values: {
    [key: string]: string | { url: string; fileName: string };
  }) => {
    console.log(values);

    try {
      setRunStatus("RUNNING");
      setOutputs({});
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
        app.orgSlug,
        app.appSlug,
      );
      streamRunOutput(runId, values);
    } catch (error) {
      console.error("Error running app:", error);
      setRunStatus("ERROR");
    }
  };

  const streamRunOutput = async (runId: string, values: FormSchema) => {
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
          const input = currentVersion.inputs.find((i) => i.name === name);
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

        // Store the final outputs in the ref
        const run = {
          outputs: latestOutputsRef.current,
          inputs,
          runTime: new Date().toISOString(),
        };

        // Update app with the new run
        const updatedApp = {
          ...app,
          versions: app.versions.map((v) =>
            v.version === currentVersion?.version
              ? { ...v, runs: [...v.runs, run] }
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

              // Update the ref instead of state directly
              latestOutputsRef.current = {
                ...latestOutputsRef.current,
                [data.path]:
                  (latestOutputsRef.current[data.path] || "") + data.content,
              };

              // Update the state with the new outputs
              setOutputs(latestOutputsRef.current);

              jsonBuffer = "";
            } catch (error) {
              console.log("Not yet complete JSON", error);
            }
          }
        }
      }
    }
  };

  const setInputValues = (values: Partial<FormSchema>) => {
    (
      Object.entries(values) as [
        keyof FormSchema,
        FormSchema[keyof FormSchema],
      ][]
    ).forEach(([key, value]) => {
      form.setValue(key, value as FormSchema[keyof FormSchema]);
    });
    console.log(form.getValues());
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <RunHistory
          currentVersion={currentVersion}
          setInputValues={setInputValues}
          setOutputs={setOutputs}
        />
        <h4 className="text-md font-semibold">Inputs:</h4>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleStartRun)}
          className="space-y-4"
        >
          {currentVersion.inputs.map((input) => (
            <FormField
              key={input.name}
              control={form.control}
              name={input.name as keyof FormSchema}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{input.name}</FormLabel>
                  <FormControl>
                    {input.type === "longtext" ? (
                      <Textarea
                        placeholder={input.description || ""}
                        {...field}
                      />
                    ) : input.type === "text" ? (
                      <Input
                        type="text"
                        placeholder={input.description || ""}
                        {...field}
                      />
                    ) : (
                      <FileUpload type={input.type} field={field} />
                    )}
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
          <Button type="submit" disabled={runStatus === "RUNNING"}>
            {runStatus === "RUNNING" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {runStatus === "RUNNING" ? "Running..." : "Run"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
