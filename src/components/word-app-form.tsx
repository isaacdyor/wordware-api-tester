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

interface WordAppFormProps {
  currentVersion: VersionWithRuns;
  setOutputs: (outputs: Record<string, string>) => void;
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

      console.log(formattedValues);

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
        break;
      }

      // Decode the chunk and split by lines
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      // Process each line
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          jsonBuffer += line.slice(6);
          if (jsonBuffer.trim().endsWith("}")) {
            try {
              const data = JSON.parse(jsonBuffer);

              // Update outputs by appending content to existing path or creating new one
              setOutputs((prevOutputs) => ({
                ...prevOutputs,
                [data.path]: (prevOutputs[data.path] || "") + data.content,
              }));

              // Reset buffer after successful parse
              jsonBuffer = "";
            } catch (error) {
              // If we can't parse yet, we might need more lines
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
      const parsedValue = JSON.parse(value);
      form.setValue(key, parsedValue as FormSchema[keyof FormSchema]);
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
          <Button
            type="submit"
            disabled={runStatus === "RUNNING" || !form.formState.isValid}
          >
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
