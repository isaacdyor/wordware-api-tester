import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "./ui/input";

import { answerAsk } from "@/actions/actions";
import {
  useApiKey,
  useAsk,
  useOutputRef,
  useRunId,
  useStoreActions,
} from "@/stores/store";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";

export function AskInput() {
  const ask = useAsk();
  const apiKey = useApiKey();
  const runId = useRunId();
  const outputRef = useOutputRef();
  const { setRunStatus, setOutputs } = useStoreActions();

  const askInputSchema = z.object({
    response: z.string(),
  });

  type AskInputData = z.infer<typeof askInputSchema>;

  const form = useForm<AskInputData>({
    resolver: zodResolver(askInputSchema),
    defaultValues: {
      response: "",
    },
  });

  const onSubmit = async (data: AskInputData) => {
    if (!ask || !runId) return;
    setRunStatus("RUNNING");

    outputRef.current = [
      ...outputRef.current,
      {
        content: data.response,
        role: "user",
        path: "",
      },
    ];
    setOutputs(outputRef.current);

    await answerAsk(apiKey, runId, ask.askId, data.response);
  };

  return (
    <Form {...form}>
      <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="response"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="group flex w-full rounded-md focus-within:ring-1 focus-within:ring-ring">
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder={ask?.content.value}
                    className="rounded-l-md rounded-r-none focus-visible:ring-0"
                    {...field}
                  />
                  <Button
                    disabled={form.formState.isSubmitting}
                    type="submit"
                    size="icon"
                    className="rounded-l-none rounded-r-md border border-l-0 px-2 text-muted-foreground"
                    variant="secondary"
                  >
                    {form.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
