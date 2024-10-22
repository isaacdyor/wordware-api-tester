import { z } from "zod";

const AppSchema = z.object({
  orgSlug: z.string(),
  appSlug: z.string(),
  visibility: z.string(),
  latestVersion: z.string().optional(),
  created: z.string(),
  lastUpdated: z.string(),
});

const InputSchema = z.object({
  name: z.string(),
  type: z.enum(["text", "longtext", "image", "audio"]),
  description: z.string().optional(),
});

const AppVersionSchema = z.object({
  orgSlug: z.string(),
  appSlug: z.string(),
  title: z.string(),
  description: z.string(),
  version: z.string(),
  inputs: z.array(InputSchema),
  created: z.string(),
  examples: z.record(z.unknown()).optional(),
});

const RunResponseSchema = z.object({
  runId: z.string(),
});

const RunStatusSchema = z.object({
  status: z.enum(["RUNNING", "COMPLETE", "ERROR"]),
  outputs: z.record(z.unknown()).optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

export type App = z.infer<typeof AppSchema>;
export type AppVersion = z.infer<typeof AppVersionSchema>;
export type RunStatus = z.infer<typeof RunStatusSchema>;

export async function fetchWordApps(apiKey: string): Promise<App[]> {
  try {
    const response = await fetch("https://api.wordware.ai/v1alpha/apps/", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return z.array(AppSchema).parse(data);
  } catch (error) {
    console.error("Error fetching Word apps:", error);
    throw error;
  }
}

export async function fetchAppVersion(
  apiKey: string,
  orgSlug: string,
  appSlug: string,
  version: string
): Promise<AppVersion> {
  try {
    const response = await fetch(
      `https://api.wordware.ai/v1alpha/apps/${orgSlug}/${appSlug}/${version}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return AppVersionSchema.parse({ ...data, orgSlug, appSlug });
  } catch (error) {
    console.error("Error fetching app version:", error);
    throw error;
  }
}

export async function startRun(
  apiKey: string,
  app: AppVersion,
  inputs: Record<string, string>
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.wordware.ai/v1alpha/apps/${app.orgSlug}/${app.appSlug}/${app.version}/runs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs }),
      }
    );

    if (!response.ok) throw new Error("Failed to start run");

    const data = await response.json();
    const { runId } = RunResponseSchema.parse(data);
    return runId;
  } catch (error) {
    console.error("Error starting run:", error);
    throw error;
  }
}

export async function pollRun(
  apiKey: string,
  runId: string
): Promise<RunStatus> {
  try {
    const response = await fetch(
      `https://api.wordware.ai/v1alpha/runs/${runId}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch run status");

    const data = await response.json();
    return RunStatusSchema.parse(data);
  } catch (error) {
    console.error("Error polling run:", error);
    throw error;
  }
}
