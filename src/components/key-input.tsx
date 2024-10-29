import { fetchAppVersions, fetchWordApps } from "@/actions/actions";
import { AppWithVersions } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Key, Loader2, Save, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import Link from "next/link";

interface KeyInputProps {
  apiKey: string;
  updateApiKey: (newApiKey: string) => void;
  updateApps: (newApps: AppWithVersions[] | null) => void;
  apps: AppWithVersions[] | null;
  setIsFetching: (isFetching: boolean) => void;
}

export function KeyInput({
  apiKey,
  updateApiKey,
  updateApps,
  apps,
  setIsFetching,
}: KeyInputProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    apiKey: z.string(),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  // set the default value once loaded from local storage
  useEffect(() => {
    form.reset({ apiKey });
  }, [apiKey, form]);

  const appsRef = useRef(apps);

  useEffect(() => {
    appsRef.current = apps;
  }, [apps]);

  const fetchApps = useCallback(
    async (apiKey: string) => {
      setIsFetching(true);
      try {
        const fetchedApps = await fetchWordApps(apiKey);
        const appsWithVersions: AppWithVersions[] = [];

        for (const app of fetchedApps) {
          try {
            const versions = await fetchAppVersions(
              apiKey,
              app.orgSlug,
              app.appSlug,
            );

            const versionsSorted = versions.reverse();

            // Find existing app to check for selected version
            const existingApp = appsRef.current?.find(
              (a) => a.appSlug === app.appSlug,
            );

            const versionWithRuns = versionsSorted.map((version) => {
              const existingVersion = existingApp?.versions.find(
                (v) => v.version === version.version,
              );
              if (existingVersion) {
                return {
                  ...version,
                  runs: existingVersion.runs,
                };
              } else {
                return {
                  ...version,
                  runs: [],
                };
              }
            });

            // Determine selected version
            let selectedVersion = versionsSorted[0]?.version || "";
            if (existingApp?.selectedVersion) {
              // Check if the previously selected version still exists
              const versionStillExists = versionsSorted.some(
                (v) => v.version === existingApp.selectedVersion,
              );
              if (versionStillExists) {
                selectedVersion = existingApp.selectedVersion;
              }
            }

            appsWithVersions.push({
              ...app,
              versions: versionWithRuns,
              selectedVersion,
            });
          } catch (versionError) {
            console.error(
              `Error fetching versions for ${app.appSlug}:`,
              versionError,
            );
          }
        }

        appsWithVersions.sort(
          (a, b) =>
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime(),
        );

        updateApps(appsWithVersions);
      } catch (error) {
        console.error("Failed to fetch apps:", error);
      } finally {
        setIsFetching(false);
      }
    },
    [setIsFetching, updateApps],
  );

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      updateApiKey(data.apiKey);
      setIsFetching(true);
      await fetchApps(data.apiKey);
    } catch (error) {
      console.error("Failed to fetch apps:", error);
      setError(
        "Failed to fetch apps. Please check your API key and try again.",
      );
    } finally {
      setIsSubmitting(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (apiKey) {
      fetchApps(apiKey);
    }
  }, [apiKey, fetchApps]);

  return open ? (
    <div className="flex w-full items-center gap-1">
      <X
        className="h-4 w-4 cursor-pointer rounded-md text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(false)}
      />
      <Form {...form}>
        <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex">
                    <Input
                      disabled={isSubmitting}
                      placeholder="API Key"
                      className="w-[488px] rounded-r-none"
                      {...field}
                    />
                    <Button
                      disabled={isSubmitting}
                      type="submit"
                      size="icon"
                      className="rounded-l-none px-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
                {error && <p className="text-destructive">{error}</p>}
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  ) : (
    <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
      <Key className="h-4 w-4 text-muted-foreground" />
    </Button>
  );
}
