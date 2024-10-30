"use client";

import { startRun } from "@/actions/actions";
import { useState } from "react";

const apiKey = "ww-4yBapCwfmpRWhvQo5zgjkFejdwUtCs7dDLrxDnyvaQ1U1EXKfTmYsj";

export function Trial() {
  const [loading, setLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");

  const handleStartRun = async () => {
    setLoading(true);
    setStreamedResponse(""); // Reset the response at the start of a new run

    const runId = await startRun(
      apiKey,
      "1.0",
      {
        question: "Please teach me how to code in 1 sentence ",
      },
      "isaac-dyor-d74b42",
      "315d3773-04b9-4219-8dea-e19482707de7",
    );

    const response = await fetch(`/api/stream/${runId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let jsonBuffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log("Stream complete");
        break;
      }

      // Decode the chunk and split by lines
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      // Process each line
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          jsonBuffer += line.slice(6);
          if (jsonBuffer.trim().endsWith("}")) {
            try {
              const data = JSON.parse(jsonBuffer);
              console.log("Parsed data:", data);
              if (data.content) {
                setStreamedResponse((prev) => prev + data.content);
              }
              // Reset buffer after successful parse
              jsonBuffer = "";
            } catch (error) {
              // If we can't parse yet, we might need more lines
              console.log("Not yet complete JSON");
            }
          }
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">WordWare Stream</h1>
      <button
        className="mb-4 rounded bg-teal-500 p-2 disabled:cursor-not-allowed"
        onClick={handleStartRun}
        disabled={loading}
      >
        {loading ? "Loading..." : "Start run"}
      </button>
      {streamedResponse && (
        <div className="mt-4 rounded border p-4">
          <h2 className="mb-2 text-xl font-semibold">Streamed Response:</h2>
          <p className="whitespace-pre-wrap">{streamedResponse}</p>
        </div>
      )}
    </div>
  );
}
