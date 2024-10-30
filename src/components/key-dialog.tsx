"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useApiKeyForm } from "@/hooks/useApiKeyForm";
import { useApiKey } from "@/stores/store";
import { redirect } from "next/navigation";

export default function KeyDialog() {
  const apiKey = useApiKey();
  const { form, error, onSubmit } = useApiKeyForm();
  if (apiKey) {
    redirect("/apps");
  }

  return (
    <Dialog defaultOpen={true} open={true}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter API Key</DialogTitle>
          <DialogDescription>
            Please enter your API key to continue.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="API Key"
                      className="rounded-r-none border-r-0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {error && <p className="text-destructive">{error}</p>}
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit">Save API Key</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
