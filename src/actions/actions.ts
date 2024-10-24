"use server";

import {
  App,
  AppSchema,
  AppVersion,
  AppVersionSchema,
  Run,
  RunResponseSchema,
  RunSchema,
} from "@/types/types";
import { z } from "zod";

export async function fetchWordApps(apiKey: string): Promise<App[]> {
  try {
    const response = await fetch("https://api.wordware.ai/v1alpha/apps/", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return z.array(AppSchema).parse(data);
  } catch (error) {
    console.error("Error fetching Word apps:", error);
    throw error;
  }
}

export async function fetchAppVersions(
  apiKey: string,
  orgSlug: string,
  appSlug: string
): Promise<AppVersion[]> {
  try {
    const response = await fetch(
      `https://api.wordware.ai/v1alpha/apps/${orgSlug}/${appSlug}/versions`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return z.array(AppVersionSchema).parse(data);
  } catch (error) {
    console.error("Error fetching app versions:", error);
    throw error;
  }
}

export async function startRun(
  apiKey: string,
  version: string,
  inputs: Record<string, string>,
  orgSlug: string,
  appSlug: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.wordware.ai/v1alpha/apps/${orgSlug}/${appSlug}/${version}/runs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs }),
      }
    );

    if (!response.ok) throw new Error("Failed to start run");

    const data = await response.json();
    const { runId } = RunResponseSchema.parse(data);
    return runId;
  } catch (error) {
    console.error("Error starting run:", error);
    throw error;
  }
}

export async function pollRun(apiKey: string, runId: string): Promise<Run> {
  try {
    const response = await fetch(
      `https://api.wordware.ai/v1alpha/runs/${runId}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch run status");

    const data = await response.json();
    return RunSchema.parse(data);
  } catch (error) {
    console.error("Error polling run:", error);
    throw error;
  }
}

export async function uploadFile(file: File): Promise<string> {
  return await new Promise((resolve) => {
    resolve(file.name);
  });
}
