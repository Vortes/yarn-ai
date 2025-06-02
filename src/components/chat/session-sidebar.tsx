"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { PlusCircle, MessageSquare } from "lucide-react";
import { cn } from "~/lib/utils";

export interface ChatSession {
  id: string;
  title: string;
  date: Date;
  framework: string;
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
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Sessions</h2>
        <Button
          onClick={onNewSession}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <PlusCircle className="h-5 w-5" />
          <span className="sr-only">New session</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
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
                      {" · "}
                      {session.framework}
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
    </div>
  );
}
