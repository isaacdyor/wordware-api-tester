import { useApps } from "@/stores/store";
import { redirect } from "next/navigation";

export default function Home() {
  const apps = useApps();
  if (!apps || apps.length === 0) {
    return null;
  }

  redirect(`/apps/${apps[0].appSlug}`);
}
