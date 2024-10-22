"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCcw, Play, ChevronDown, ChevronUp } from "lucide-react";
import {
  fetchWordApps,
  fetchAppVersion,
  startRun,
  pollRun,
} from "@/actions/actions";
import type { AppVersion, RunStatus } from "@/actions/actions";

type RunOutput = RunStatus & { status: RunStatus["status"] | "IDLE" };

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [appVersions, setAppVersions] = useState<AppVersion[]>([]);
  const [appInputs, setAppInputs] = useState<
    Record<string, Record<string, string>>
  >({});
  const [runOutputs, setRunOutputs] = useState<Record<string, RunOutput>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  useEffect(() => {
    // Load data from local storage on component mount
    const storedApiKey = localStorage.getItem("apiKey");
    const storedAppVersions = localStorage.getItem("appVersions");

    if (storedApiKey) setApiKey(storedApiKey);
    if (storedAppVersions) {
      const parsedAppVersions = JSON.parse(storedAppVersions);
      setAppVersions(parsedAppVersions);
    }
  }, []);

  useEffect(() => {
    // Save data to local storage whenever it changes
    if (apiKey) localStorage.setItem("apiKey", apiKey);
    if (appVersions.length > 0)
      localStorage.setItem("appVersions", JSON.stringify(appVersions));
  }, [apiKey, appVersions]);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedApps = await fetchWordApps(apiKey);
      const versions: AppVersion[] = [];

      for (const app of fetchedApps) {
        try {
          const version = await fetchAppVersion(
            apiKey,
            app.orgSlug,
            app.appSlug,
            app.latestVersion || "1.0"
          );
          versions.push(version);
        } catch (versionError) {
          console.error(
            `Error fetching version for ${app.appSlug}:`,
            versionError
          );
        }
      }

      setAppVersions(versions);
    } catch (error) {
      console.error("Failed to fetch apps:", error);
      setError(
        "Failed to fetch apps. Please check your API key and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    appKey: string,
    inputName: string,
    value: string
  ) => {
    setAppInputs((prev) => ({
      ...prev,
      [appKey]: {
        ...prev[appKey],
        [inputName]: value,
      },
    }));
  };

  const handleStartRun = async (app: AppVersion, appKey: string) => {
    try {
      setRunOutputs((prev) => ({ ...prev, [appKey]: { status: "RUNNING" } }));
      const runId = await startRun(apiKey, app, appInputs[appKey] || {});
      pollRunStatus(runId, appKey);
    } catch (error) {
      console.error("Error starting run:", error);
      setRunOutputs((prev) => ({
        ...prev,
        [appKey]: {
          status: "ERROR",
          errors: [{ message: "Failed to start run" }],
        },
      }));
    }
  };

  const pollRunStatus = async (runId: string, appKey: string) => {
    try {
      const runStatus = await pollRun(apiKey, runId);
      setRunOutputs((prev) => ({ ...prev, [appKey]: runStatus }));

      if (runStatus.status === "RUNNING") {
        setTimeout(() => pollRunStatus(runId, appKey), 1000);
      }
    } catch (error) {
      console.error("Error polling run:", error);
      setRunOutputs((prev) => ({
        ...prev,
        [appKey]: {
          status: "ERROR",
          errors: [{ message: "Failed to fetch run status" }],
        },
      }));
    }
  };

  const toggleAppExpansion = (appKey: string) => {
    setExpandedApp((prevExpanded) => (prevExpanded === appKey ? null : appKey));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl space-y-4">
        <div>
          <Label htmlFor="apiKey">API Key</Label>
          <div className="flex items-center gap-2">
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
            />
            <Button size="icon" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCcw className={isLoading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        {error && <p className="text-destructive">{error}</p>}

        {appVersions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Word Apps:</h2>
            <ul className="space-y-2">
              {appVersions.map((app) => {
                const versionKey = `${app.orgSlug}/${app.appSlug}`;
                const runOutput = runOutputs[versionKey];
                const isExpanded = expandedApp === versionKey;

                return (
                  <li
                    key={versionKey}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex justify-between items-center p-4 cursor-pointer bg-muted hover:bg-muted/80"
                      onClick={() => toggleAppExpansion(versionKey)}
                    >
                      <h3 className="text-lg font-semibold">
                        {app.title || app.appSlug}
                      </h3>
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </div>
                    {isExpanded && (
                      <div className="p-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {app.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p>
                            <strong>Org Slug:</strong> {app.orgSlug}
                          </p>
                          <p>
                            <strong>App Slug:</strong> {app.appSlug}
                          </p>
                          <p>
                            <strong>Version:</strong> {app.version}
                          </p>
                          <p>
                            <strong>Created:</strong>{" "}
                            {new Date(app.created).toLocaleString()}
                          </p>
                        </div>

                        <h4 className="text-md font-semibold mt-4 mb-2">
                          Inputs:
                        </h4>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleStartRun(app, versionKey);
                          }}
                          className="space-y-2"
                        >
                          {app.inputs.map((input, index) => (
                            <div key={index}>
                              <Label htmlFor={`${versionKey}-${input.name}`}>
                                {input.name}
                              </Label>
                              {input.type === "longtext" ? (
                                <Textarea
                                  id={`${versionKey}-${input.name}`}
                                  value={
                                    appInputs[versionKey]?.[input.name] || ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      versionKey,
                                      input.name,
                                      e.target.value
                                    )
                                  }
                                  placeholder={input.description || ""}
                                />
                              ) : (
                                <Input
                                  id={`${versionKey}-${input.name}`}
                                  type={input.type === "text" ? "text" : "file"}
                                  value={
                                    appInputs[versionKey]?.[input.name] || ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      versionKey,
                                      input.name,
                                      e.target.value
                                    )
                                  }
                                  placeholder={input.description || ""}
                                />
                              )}
                            </div>
                          ))}
                          <Button
                            type="submit"
                            disabled={runOutput?.status === "RUNNING"}
                          >
                            <Play className="mr-2 h-4 w-4" /> Run
                          </Button>
                        </form>

                        {runOutput && (
                          <div className="mt-4">
                            <h4 className="text-md font-semibold mb-2">
                              Run Status: {runOutput.status}
                            </h4>
                            {runOutput.status === "COMPLETE" &&
                              runOutput.outputs && (
                                <div>
                                  <h5 className="font-semibold">Outputs:</h5>
                                  <pre className="bg-muted p-2 rounded mt-2 overflow-x-auto">
                                    {JSON.stringify(runOutput.outputs, null, 2)}
                                  </pre>
                                </div>
                              )}
                            {runOutput.status === "ERROR" &&
                              runOutput.errors && (
                                <div>
                                  <h5 className="font-semibold text-destructive">
                                    Errors:
                                  </h5>
                                  <ul className="list-disc pl-5 mt-2">
                                    {runOutput.errors.map((error, index) => (
                                      <li
                                        key={index}
                                        className="text-destructive"
                                      >
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
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
