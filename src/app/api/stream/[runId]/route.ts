// app/api/wordware/[runId]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  const runId = params.runId;
  const apiKey = request.headers.get("authorization")?.split(" ")[1];

  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 401 });
  }

  const response = await fetch(
    `https://api.wordware.ai/v1alpha/runs/${runId}/stream`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.body) {
    throw new Error("No response body");
  }

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
