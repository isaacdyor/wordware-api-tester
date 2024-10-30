import { fetchAppVersions, fetchWordApps } from "@/actions/actions";
import { useApiKey, useApps, useStoreActions } from "@/stores/store";
import { AppWithVersions } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function useApiKeyForm() {
  const apiKey = useApiKey();
  const { updateApiKey, updateApps, setAppsLoading, setBackgroundRefresh } =
    useStoreActions();
  const apps = useApps();

  const [error, setError] = useState<string | null>(null);

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
    form.reset({ apiKey: apiKey ?? "" });
  }, [apiKey, form]);

  const appsRef = useRef(apps);

  useEffect(() => {
    appsRef.current = apps;
  }, [apps]);

  const fetchApps = useCallback(
    async (apiKey: string) => {
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
        setError(
          "Failed to fetch apps. Please check your API key and try again.",
        );
      } finally {
        setBackgroundRefresh(false);
      }
    },
    [updateApps],
  );

  const onSubmit = async (data: FormData) => {
    setError(null);
    setAppsLoading(true);
    try {
      updateApiKey(data.apiKey);
      await fetchApps(data.apiKey);
    } catch (error) {
      console.error("Failed to fetch apps:", error);
      setError(
        "Failed to fetch apps. Please check your API key and try again.",
      );
    } finally {
      setAppsLoading(false);
    }
  };

  return {
    form,
    error,
    onSubmit,
    fetchApps,
  };
}
