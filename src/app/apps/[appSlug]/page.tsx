"use client";

import { Output } from "@/components/output";
import { RunTable } from "@/components/run-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WordAppForm } from "@/components/word-app-form";
import { useLocalStore } from "@/stores/useLocalStore";
import { createFormSchema, FormSchema } from "@/types/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

export default function AppDetail() {
  const { currentApp, currentVersion } = useLocalStore();
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"playground" | "api" | "previous-runs">(
    "playground",
  );
  const [runStatus, setRunStatus] = useState<
    "COMPLETE" | "RUNNING" | "ERROR" | null
  >(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(createFormSchema(currentVersion)),
    defaultValues: {},
  });

  useEffect(() => {
    if (currentVersion) {
      const defaultValues = currentVersion.inputs.reduce(
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
      );

      form.reset(defaultValues);
    }
  }, [currentVersion, form]);

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
        <TabsContent value="playground" className="flex flex-1 overflow-hidden">
          <div className="flex h-full w-full gap-4">
            <WordAppForm
              setOutputs={setOutputs}
              setRunStatus={setRunStatus}
              runStatus={runStatus}
              form={form}
            />

            <Output runOutputs={outputs} />
          </div>
        </TabsContent>
        <TabsContent value="api" className="flex-1">
          Change your password here.
        </TabsContent>
        <TabsContent value="previous-runs" className="flex-1">
          <RunTable
            setTab={setTab}
            setInputValues={setInputValues}
            setOutputs={setOutputs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
