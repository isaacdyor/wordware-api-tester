"use client";

import type { AppWithVersions, Run } from "@/types/types";
import { pollRun, startRun } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Info, Loader2, Play } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Output } from "./output";
import { RunHistory } from "./history";

interface WordAppProps {
  app: AppWithVersions;
  isOpened: boolean;
  toggleOpen: () => void;
  apiKey: string;
  updateApp: (newApp: AppWithVersions) => void;
}

export function WordApp({
  app,
  isOpened,
  toggleOpen,
  apiKey,
  updateApp,
}: WordAppProps) {
  const [runOutput, setRunOutput] = useState<Run | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const appKey = `${app.orgSlug}/${app.appSlug}`;

  const currentVersion = app.versions.find(
    (v) => v.version === app.selectedVersion
  );

  // Update the createFormSchema function
  const createFormSchema = () => {
    if (!currentVersion) return z.object({});

    const schemaFields = currentVersion.inputs.reduce((acc, input) => {
      acc[input.name] = z
        .string()
        .min(1, { message: "This field is required" });
      return acc;
    }, {} as Record<string, z.ZodString>);

    return z.object(schemaFields);
  };

  const form = useForm<z.infer<ReturnType<typeof createFormSchema>>>({
    resolver: zodResolver(createFormSchema()),
    defaultValues: currentVersion?.inputs.reduce((acc, input) => {
      acc[input.name] = "";
      return acc;
    }, {} as Record<string, string>),
  });

  // Add this type assertion
  type FormSchema = z.infer<ReturnType<typeof createFormSchema>>;

  const handleStartRun = async (values: FormSchema) => {
    try {
      setRunOutput({ status: "RUNNING" });
      if (!currentVersion) throw new Error("Selected version not found");

      const runId = await startRun(
        apiKey,
        currentVersion.version,
        values,
        app.orgSlug,
        app.appSlug
      );
      pollRunStatus(runId, values);
    } catch (error) {
      console.error("Error running app:", error);
      setRunOutput({
        status: "ERROR",
        errors: [{ message: "Failed to run app" }],
      });
    }
  };

  const pollRunStatus = async (runId: string, values: FormSchema) => {
    try {
      const runStatus = await pollRun(apiKey, runId);
      setRunOutput(runStatus);
      if (runStatus.status === "COMPLETE") {
        const inputs = Object.entries(values).map(([name, value]) => ({
          name,
          value: String(value),
        }));
        const run = { ...runStatus, inputs };

        const updatedApp = {
          ...app,
          versions: app.versions.map((v) =>
            v.version === currentVersion?.version
              ? { ...v, runs: [...v.runs, run] }
              : v
          ),
        };

        updateApp(updatedApp);
      }
      if (runStatus.status === "RUNNING") {
        // Continue polling after a short delay
        setTimeout(() => pollRunStatus(runId, values), 1000);
      }
    } catch (error) {
      console.error("Error polling run:", error);
      setRunOutput({
        status: "ERROR",
        errors: [{ message: "Failed to fetch run status" }],
      });
    }
  };

  useEffect(() => {
    if (isOpened) {
      setIsClosing(false);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => setIsClosing(false), 300); // Reduced from 500ms to 300ms
      return () => clearTimeout(timer);
    }
  }, [isOpened]);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpened) {
        contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
      } else {
        contentRef.current.style.maxHeight = "0px";
      }
    }
  }, [isOpened, currentVersion, runOutput]);

  // Add this new function to set input values
  const setInputValues = (values: Partial<FormSchema>) => {
    (
      Object.entries(values) as [
        keyof FormSchema,
        FormSchema[keyof FormSchema]
      ][]
    ).forEach(([key, value]) => {
      form.setValue(key, value);
    });
  };

  return (
    <li className="border rounded-lg overflow-hidden">
      <div
        className="flex justify-between items-center p-4 cursor-pointer bg-muted hover:bg-muted/80"
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">
            {currentVersion?.title || app.appSlug}
          </h3>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent
                className="max-w-xs border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <p>
                  <strong>Org Slug:</strong> {app.orgSlug}
                </p>
                <p>
                  <strong>App Slug:</strong> {app.appSlug}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {app.created ? new Date(app.created).toLocaleString() : "N/A"}
                </p>
                <p>
                  <strong>Updated:</strong>{" "}
                  {app.lastUpdated
                    ? new Date(app.lastUpdated).toLocaleString()
                    : "N/A"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <ChevronDown
          className={`transform transition-transform duration-300 ease-out ${
            isOpened ? "rotate-180" : ""
          }`}
        />
      </div>
      <div
        ref={contentRef}
        className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
          isClosing ? "invisible" : ""
        }`}
      >
        {currentVersion && (
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              {currentVersion.description}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="col-span-2">
                <Label htmlFor={`${appKey}-version`}>Version</Label>
                <Select
                  value={app.selectedVersion}
                  onValueChange={(version) =>
                    updateApp({ ...app, selectedVersion: version })
                  }
                >
                  <SelectTrigger id={`${appKey}-version`}>
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {app.versions.map((version) => (
                      <SelectItem key={version.version} value={version.version}>
                        {version.version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <RunHistory
                currentVersion={currentVersion}
                setInputValues={setInputValues}
                setRunOutput={setRunOutput}
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
                          ) : (
                            <Input
                              type="text"
                              placeholder={input.description || ""}
                              {...field}
                            />
                          )}
                        </FormControl>
                        <FormDescription>{input.description}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="submit"
                  disabled={runOutput?.status === "RUNNING"}
                >
                  {runOutput?.status === "RUNNING" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {runOutput?.status === "RUNNING" ? "Running..." : "Run"}
                </Button>
              </form>
            </Form>

            {runOutput && (
              <div className="mt-4">
                {runOutput.status === "COMPLETE" && runOutput.outputs && (
                  <Output runOutputs={runOutput.outputs} />
                )}
                {runOutput.status === "ERROR" && runOutput.errors && (
                  <div>
                    <h5 className="font-semibold text-destructive">Errors:</h5>
                    <ul className="list-disc pl-5 mt-2">
                      {runOutput.errors.map((error, index) => (
                        <li key={index} className="text-destructive">
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
