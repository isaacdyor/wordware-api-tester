import { useApiKeyForm } from "@/hooks/useApiKeyForm";
import { Key, Loader2, Save, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { useAppsLoading } from "@/stores/store";

export function KeyInput() {
  const [open, setOpen] = useState(false);
  const appsLoading = useAppsLoading();
  const { form, error, onSubmit } = useApiKeyForm();

  const handleSubmit = async (data: { apiKey: string }) => {
    await onSubmit(data);
    setOpen(false);
  };

  return open ? (
    <div className="flex w-full items-center gap-1">
      <X
        className="h-4 w-4 cursor-pointer rounded-md text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(false)}
      />
      <Form {...form}>
        <form className="w-full" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="group flex w-full rounded-md focus-within:ring-1 focus-within:ring-ring">
                    <Input
                      disabled={appsLoading}
                      placeholder="API Key"
                      className="w-[488px] rounded-r-none border-r-0"
                      {...field}
                    />
                    <Button
                      disabled={appsLoading}
                      type="submit"
                      size="icon"
                      className="rounded-l-none px-2 text-muted-foreground"
                      variant="secondary"
                    >
                      {appsLoading ? (
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
