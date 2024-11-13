"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useState } from "react";
import { Logo } from "./logo";
import { NavMain } from "./nav-main";

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SidebarProvider open={isOpen} onOpenChange={setIsOpen}>
      <Sidebar collapsible="icon">
        <SidebarHeader
          className={cn(
            "pb-6 transition-[padding] duration-200",
            isOpen && "pt-4",
          )}
        >
          <Link href="/">
            <Logo isClosed={!isOpen} className="ml-2 mt-0.5 fill-foreground" />
          </Link>
        </SidebarHeader>
        <SidebarGroup>
          <Link href="https://app.wordware.ai/">
            <SidebarMenuButton tooltip="Create Chat">
              <Plus />
              <span>Create New App</span>
            </SidebarMenuButton>
          </Link>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarContent>
          <NavMain />
        </SidebarContent>

        <SidebarRail />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
