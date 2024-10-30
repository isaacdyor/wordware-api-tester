"use client";

import { OutputDisplay } from "@/components/output-display";
import { RunTable } from "@/components/run-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WordAppForm } from "@/components/word-app-form";
import { useCurrentApp, useCurrentVersion } from "@/stores/store";
import { createFormSchema, FormSchema } from "@/types/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function AppDetail() {
  const currentApp = useCurrentApp();
  const currentVersion = useCurrentVersion();

  const [tab, setTab] = useState<"playground" | "api" | "previous-runs">(
    "playground",
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(createFormSchema(currentVersion)),
    defaultValues: currentVersion?.inputs.reduce(
      (acc, input) => {
        acc[input.name] =
          input.type === "image" ||
          input.type === "audio" ||
          input.type === "file"
            ? null
            : "";
        return acc;
      },
      {} as Record<string, string | null>,
    ),
  });

  const setInputValues = (values: Partial<FormSchema>) => {
    (
      Object.entries(values) as [
        keyof FormSchema,
        FormSchema[keyof FormSchema],
      ][]
    ).forEach(([key, value]) => {
      form.setValue(key, value as FormSchema[keyof FormSchema]);
    });
  };

  if (!currentApp || !currentVersion) {
    return <div>App not found</div>;
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">{currentVersion?.title}</h1>
      </div>

      <Tabs
        defaultValue="playground"
        className="flex flex-1 flex-col overflow-hidden"
        value={tab}
        onValueChange={(value) =>
          setTab(value as "playground" | "api" | "previous-runs")
        }
      >
        <TabsList className="w-full justify-start">
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="previous-runs">Previous runs</TabsTrigger>
        </TabsList>
        <TabsContent
          value="playground"
          className="flex flex-1 overflow-hidden data-[state=inactive]:hidden"
        >
          <div className="flex h-full w-full gap-4">
            <WordAppForm form={form} />

            <OutputDisplay />
          </div>
        </TabsContent>
        <TabsContent value="api" className="flex-1">
          V0 API
        </TabsContent>
        <TabsContent value="previous-runs" className="flex-1">
          <RunTable setTab={setTab} setInputValues={setInputValues} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
