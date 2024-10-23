import { fetchAppVersions, fetchWordApps } from "@/actions/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { AppWithVersions } from "@/types/types";
import { useLocal } from "@/hooks/useLocal";

interface KeyInputProps {
  updateApiKey: (newApiKey: string) => void;
  updateApps: (newApps: AppWithVersions[]) => void;
  apps: AppWithVersions[];
}

export function KeyInput({ updateApiKey, updateApps, apps }: KeyInputProps) {
  const { apiKey } = useLocal();
  const [isLoading, setIsLoading] = useState(false);
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
    form.reset({ apiKey });
  }, [apiKey, form]);

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setError(null);
    updateApiKey(data.apiKey);
    try {
      const fetchedApps = await fetchWordApps(data.apiKey);
      const appsWithVersions: AppWithVersions[] = [];

      for (const app of fetchedApps) {
        try {
          const versions = await fetchAppVersions(
            data.apiKey,
            app.orgSlug,
            app.appSlug
          );

          const versionsSorted = versions.reverse();

          const versionWithRuns = versionsSorted.map((version) => {
            const existingVersion = apps
              .find((a) => a.appSlug === app.appSlug)
              ?.versions.find((v) => v.version === version.version);
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

          appsWithVersions.push({
            ...app,
            versions: versionWithRuns,
            selectedVersion: versionsSorted[0]?.version || "",
          });
        } catch (versionError) {
          console.error(
            `Error fetching versions for ${app.appSlug}:`,
            versionError
          );
        }
      }

      appsWithVersions.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );

      updateApps(appsWithVersions);
    } catch (error) {
      console.error("Failed to fetch apps:", error);
      setError(
        "Failed to fetch apps. Please check your API key and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex ">
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder="API Key"
                    className="flex-grow rounded-r-none"
                    {...field}
                  />
                  <Button
                    disabled={form.formState.isSubmitting}
                    type="submit"
                    size="icon"
                    className="rounded-l-none px-2"
                  >
                    <RefreshCw className={isLoading ? "animate-spin" : ""} />
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
  );
}
