import { z } from "zod";

export const AppSchema = z.object({
  orgSlug: z.string(),
  appSlug: z.string(),
  visibility: z.string(),
  latestVersion: z.string().optional(),
  created: z.string(),
  lastUpdated: z.string(),
});

export const InputSchema = z.object({
  name: z.string(),
  type: z.enum(["text", "longtext", "image", "audio", "file"]),
  description: z.string().optional(),
});

export const VersionSchema = z.object({
  title: z.string(),
  description: z.string(),
  version: z.string(),
  inputs: z.array(InputSchema),
  created: z.string(),
  examples: z.record(z.unknown()).optional(),
});

export const RunResponseSchema = z.object({
  runId: z.string(),
});

const AskContentSchema = z.object({
  type: z.literal("text"),
  value: z.string(),
});

// Define the main message schema
export const AskSchema = z.object({
  path: z.string(),
  content: AskContentSchema,
  askId: z.string().uuid(),
});

export type App = z.infer<typeof AppSchema>;
export type Version = z.infer<typeof VersionSchema>;
export type Ask = z.infer<typeof AskSchema>;
export type RunInput = {
  name: string;
  value: string;
};

export type Output = {
  path: string;
  content: string;
  role: "user" | "system";
};

export type Run = {
  outputs: Output[];
  runTime: string;
};

export type RunWithInputs = Run & {
  inputs: RunInput[];
};

export type VersionWithRuns = Version & {
  runs: RunWithInputs[];
};

export type AppWithVersions = App & {
  versions: VersionWithRuns[];
  selectedVersion: string;
};
