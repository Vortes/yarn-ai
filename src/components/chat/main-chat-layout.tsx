"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Menu } from "lucide-react";

interface MainChatLayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
}

export function MainChatLayout({
  children,
  sidebarContent,
}: MainChatLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-background flex h-screen">
      {/* Mobile sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="h-full py-4">{sidebarContent}</div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden w-[280px] md:block">
        <div className="h-full py-4">{sidebarContent}</div>
      </aside>

      {/* Main content */}
      <main className="flex min-h-0 flex-1 flex-col p-2.5">
        <div className="bg-background-secondary noise-bg-subtle h-full w-full rounded-xl border">
          {/* Mobile sidebar trigger */}
          <div className="flex p-4 md:hidden">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              </SheetTrigger>
            </Sheet>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
