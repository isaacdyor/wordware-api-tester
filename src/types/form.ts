import * as z from "zod";
import { VersionWithRuns } from "@/types/types";

export const createFormSchema = (
  currentVersion: VersionWithRuns | undefined,
) => {
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

// Create a helper type for inferring the schema type
export type FormSchema = z.infer<ReturnType<typeof createFormSchema>>;
