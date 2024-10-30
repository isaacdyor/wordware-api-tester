import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "./ui/input";

import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";

export function AskInput() {
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

  const onSubmit = (data: AskInputData) => {
    console.log(data);
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
                <div className="flex">
                  <Input
                    disabled={form.formState.isSubmitting}
                    placeholder="API Key"
                    className="w-[488px] rounded-r-none"
                    {...field}
                  />
                  <Button
                    disabled={form.formState.isSubmitting}
                    type="submit"
                    size="icon"
                    className="rounded-l-none px-2 text-muted-foreground"
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
