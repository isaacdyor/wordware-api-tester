"use client";

import { useApiKey } from "@/stores/store";
import { redirect } from "next/navigation";

export default function Home() {
  const apiKey = useApiKey();
  if (apiKey) {
    redirect("/apps");
  }
  return <p>hi</p>;
}
