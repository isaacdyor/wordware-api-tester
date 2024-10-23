"use client";

import type { AppWithVersions, RunStatus } from "@/actions/actions";
import { pollRun, startRun } from "@/actions/actions";
import { Button } from "@/components/ui/button";
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
import { useLocal } from "@/hooks/useLocal";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { useState, useEffect } from "react";

type RunOutput = RunStatus & { status: RunStatus["status"] | "IDLE" };

interface WordAppProps {
  app: AppWithVersions;
  apiKey: string;
}

export function WordApp({ app, apiKey }: WordAppProps) {
  const [appInputs, setAppInputs] = useState<Record<string, string | File>>({});
  const [runOutput, setRunOutput] = useState<RunOutput | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(app.selectedVersion);
  const { apps, updateApps } = useLocal();

  const appKey = `${app.orgSlug}/${app.appSlug}`;

  useEffect(() => {
    setSelectedVersion(app.selectedVersion);
  }, [app.selectedVersion]);

  const handleInputChange = (inputName: string, value: string | File) => {
    setAppInputs((prev) => ({
      ...prev,
      [inputName]: value,
    }));
  };

  const handleFileInputChange = (inputName: string, files: FileList | null) => {
    if (files && files.length > 0) {
      handleInputChange(inputName, files[0]);
    }
  };

  const handleStartRun = async () => {
    try {
      setRunOutput({ status: "RUNNING" });
      const version = app.versions.find(
        (v) => v.version === app.selectedVersion
      );
      if (!version) throw new Error("Selected version not found");

      // Convert file inputs to base64
      const processedInputs: Record<string, string> = {};

      const runId = await startRun(
        apiKey,
        version,
        processedInputs,
        app.orgSlug,
        app.appSlug
      );
      pollRunStatus(runId);
    } catch (error) {
      console.error("Error running app:", error);
      setRunOutput({
        status: "ERROR",
        errors: [{ message: "Failed to run app" }],
      });
    }
  };

  const pollRunStatus = async (runId: string) => {
    try {
      const runStatus = await pollRun(apiKey, runId);
      setRunOutput(runStatus);

      if (runStatus.status === "RUNNING") {
        // Continue polling after a short delay
        setTimeout(() => pollRunStatus(runId), 1000);
      }
    } catch (error) {
      console.error("Error polling run:", error);
      setRunOutput({
        status: "ERROR",
        errors: [{ message: "Failed to fetch run status" }],
      });
    }
  };

  const toggleExpansion = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleVersionChange = (version: string) => {
    setSelectedVersion(version);
    const updatedApps = apps.map((currentApp) =>
      currentApp.appSlug === app.appSlug
        ? {
            ...currentApp,
            selectedVersion: version,
          }
        : currentApp
    );
    updateApps(updatedApps);
  };

  const currentVersion = app.versions.find(
    (v) => v.version === selectedVersion
  );

  return (
    <li className="border rounded-lg overflow-hidden">
      <div
        className="flex justify-between items-center p-4 cursor-pointer bg-muted hover:bg-muted/80"
        onClick={toggleExpansion}
      >
        <h3 className="text-lg font-semibold">
          {currentVersion?.title || app.appSlug}
        </h3>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </div>
      {isExpanded && currentVersion && (
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            {currentVersion.description}
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>
              <strong>Org Slug:</strong> {app.orgSlug}
            </p>
            <p>
              <strong>App Slug:</strong> {app.appSlug}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(currentVersion.created).toLocaleString()}
            </p>
            <div className="col-span-2">
              <Label htmlFor={`${appKey}-version`}>Version</Label>
              <Select
                value={selectedVersion}
                onValueChange={handleVersionChange}
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

          <h4 className="text-md font-semibold mt-4 mb-2">Inputs:</h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartRun();
            }}
            className="space-y-2"
          >
            {currentVersion.inputs.map((input, index) => (
              <div key={index}>
                <Label htmlFor={`${appKey}-${input.name}`}>{input.name}</Label>
                {input.type === "longtext" ? (
                  <Textarea
                    id={`${appKey}-${input.name}`}
                    value={
                      typeof appInputs[input.name] === "string"
                        ? (appInputs[input.name] as string)
                        : ""
                    }
                    onChange={(e) =>
                      handleInputChange(input.name, e.target.value)
                    }
                    placeholder={input.description || ""}
                  />
                ) : input.type === "text" ? (
                  <Input
                    id={`${appKey}-${input.name}`}
                    type="text"
                    value={
                      typeof appInputs[input.name] === "string"
                        ? (appInputs[input.name] as string)
                        : ""
                    }
                    onChange={(e) =>
                      handleInputChange(input.name, e.target.value)
                    }
                    placeholder={input.description || ""}
                  />
                ) : (
                  <Input
                    id={`${appKey}-${input.name}`}
                    type="file"
                    accept={input.type === "image" ? "image/*" : "audio/*"}
                    onChange={(e) =>
                      handleFileInputChange(input.name, e.target.files)
                    }
                  />
                )}
              </div>
            ))}
            <Button type="submit" disabled={runOutput?.status === "RUNNING"}>
              <Play className="mr-2 h-4 w-4" /> Run
            </Button>
          </form>

          {runOutput && (
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-2">
                Run Status: {runOutput.status}
              </h4>
              {runOutput.status === "COMPLETE" && runOutput.outputs && (
                <div>
                  <h5 className="font-semibold">Outputs:</h5>
                  <pre className="bg-muted p-2 rounded mt-2 overflow-x-auto">
                    {JSON.stringify(runOutput.outputs, null, 2)}
                  </pre>
                </div>
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
    </li>
  );
}
