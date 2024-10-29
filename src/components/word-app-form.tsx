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
import { useStream } from "@/hooks/useStream";
import { useCurrentVersion } from "@/stores/useLocalStore";
import { FormSchema } from "@/types/form";
import { Loader2, Play } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FileUpload } from "./file-upload";

interface WordAppFormProps {
  setOutputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  runStatus: "COMPLETE" | "RUNNING" | "ERROR" | null;
  setRunStatus: (status: "COMPLETE" | "RUNNING" | "ERROR" | null) => void;
  form: UseFormReturn<FormSchema>;
}

export function WordAppForm({
  setOutputs,
  setRunStatus,
  runStatus,
  form,
}: WordAppFormProps) {
  const { handleStartRun } = useStream({
    setOutputs,
    setRunStatus,
  });
  const currentVersion = useCurrentVersion();

  return (
    <div className="flex w-full max-w-80 flex-col gap-1 rounded-md border p-4">
      {currentVersion?.inputs.length && currentVersion.inputs.length > 0 && (
        <h4 className="text-md font-semibold">Inputs:</h4>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleStartRun)}
          className="space-y-4"
        >
          {currentVersion?.inputs.map((input) => (
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
