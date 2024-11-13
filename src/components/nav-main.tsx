"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";
import { useApps } from "@/stores/store";
import { useParams } from "next/dist/client/components/navigation";
import Link from "next/link";

export function NavMain() {
  const apps = useApps();

  const params = useParams();
  const appSlug = params.appSlug as string;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Word Apps</SidebarGroupLabel>
      <SidebarMenu>
        {apps?.map((app) => (
          <Link href={`/chat/${app.appSlug}`} key={app.appSlug}>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={cn(app.appSlug === appSlug && "bg-muted")}
                tooltip={app.versions[0].title}
              >
                <span>{app.versions[0].title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Link>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
