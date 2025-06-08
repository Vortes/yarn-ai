"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/theme-toggle";
import { UserProfile } from "~/components/auth/user-profile";

export interface ChatSession {
  id: string;
  title: string;
  date: Date;
}

interface SessionSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export function SessionSidebar({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
}: SessionSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col items-center justify-between px-4">
        <h2 className="text-lg font-semibold">Yarn.ai</h2>
        <Button
          onClick={onNewSession}
          variant="default"
          size="sm"
          className="my-4 w-full"
        >
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 pb-4">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <Button
                key={session.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left",
                  session.id === currentSessionId && "bg-accent",
                )}
                onClick={() => onSessionSelect(session.id)}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <div className="flex-1 truncate">
                    <div className="truncate">{session.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                      }).format(session.date)}
                    </div>
                  </div>
                </div>
              </Button>
            ))
          ) : (
            <div className="text-muted-foreground px-4 py-8 text-center text-sm">
              No sessions yet. Start a new conversation.
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom section with theme toggle and user profile */}
      <div className="mt-auto">
        <div className="flex items-center gap-x-4 px-4 pt-4">
          <UserProfile />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
