"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Menu } from "lucide-react";

interface MainChatLayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  headerContent?: React.ReactNode;
}

export function MainChatLayout({
  children,
  sidebarContent,
  headerContent,
}: MainChatLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          {/* Mobile sidebar trigger */}
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <div className="h-full py-4">{sidebarContent}</div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <h1 className="text-xl font-bold">InsightSpark</h1>
        </div>

        {/* Header content (user profile, session counter, etc.) */}
        <div className="flex items-center gap-4">{headerContent}</div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-[280px] border-r md:block">
          <ScrollArea className="h-full py-4">{sidebarContent}</ScrollArea>
        </aside>

        {/* Main content */}
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
