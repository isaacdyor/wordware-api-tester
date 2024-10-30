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
import { useCurrentVersion, useRunStatus } from "@/stores/store";
import { FormSchema } from "@/types/form";
import { Loader2, Play } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FileUpload } from "./file-upload";
import { Card, CardContent } from "./ui/card";

interface WordAppFormProps {
  form: UseFormReturn<FormSchema>;
}

export function WordAppForm({ form }: WordAppFormProps) {
  const runStatus = useRunStatus();

  const { handleStartRun } = useStream();
  const currentVersion = useCurrentVersion();

  return (
    <Card className="flex w-full max-w-80 flex-col gap-1">
      <CardContent className="p-4">
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
      </CardContent>
    </Card>
  );
}
