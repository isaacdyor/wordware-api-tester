"use server";

import {
  App,
  AppSchema,
  RunResponseSchema,
  Version,
  VersionSchema,
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
  appSlug: string,
): Promise<Version[]> {
  try {
    const response = await fetch(
      `https://api.wordware.ai/v1alpha/apps/${orgSlug}/${appSlug}/versions`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return z.array(VersionSchema).parse(data);
  } catch (error) {
    console.error("Error fetching app versions:", error);
    throw error;
  }
}

export async function startRun(
  apiKey: string,
  version: string,
  inputs: Record<
    string,
    | string
    | {
        type: string;
        image_url?: string;
        audio_url?: string;
        file_url?: string;
      }
  >,
  orgSlug: string,
  appSlug: string,
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
      },
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

export async function answerAsk(
  apiKey: string,
  runId: string,
  askId: string,
  value: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.wordware.ai/v1alpha/runs/${runId}/asks/${askId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "text",
          value: value,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    return true;
  } catch (error) {
    console.error("Error answering ask:", error);
    throw error;
  }
}
