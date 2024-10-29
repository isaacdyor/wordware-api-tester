"use client";

import { useLocal } from "@/hooks/useLocal";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { WordAppForm } from "@/components/word-app-form";

export default function AppDetail() {
  const { apps } = useLocal();
  const params = useParams<{ appSlug: string }>();
  const currentApp = apps?.find((app) => app.appSlug === params.appSlug);
  const currentVersion = currentApp?.versions.find(
    (version) => version.version === currentApp?.selectedVersion,
  );

  if (!currentApp || !currentVersion) {
    return <div>App not found</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">{currentVersion?.title}</h1>
      </div>

      <Tabs defaultValue="playground">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="previous-runs">Previous Runs</TabsTrigger>
        </TabsList>
        <TabsContent value="playground">
          <WordAppForm
            app={currentApp}
            currentVersion={currentVersion}
            setOutputs={() => {}}
            setRunStatus={() => {}}
            updateApp={() => {}}
            runStatus={null}
          />
        </TabsContent>
        <TabsContent value="api">Change your password here.</TabsContent>
        <TabsContent value="previous-runs">Previous Runs</TabsContent>
      </Tabs>
    </div>
  );
}
