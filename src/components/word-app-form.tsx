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
import { useStream } from "@/hooks/useStream";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Play } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FileUpload } from "./file-upload";
import { RunHistory } from "./history";

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

  const { handleStartRun } = useStream({
    apiKey,
    currentVersion,
    app,
    updateApp,
    setOutputs,
    setRunStatus,
  });

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
