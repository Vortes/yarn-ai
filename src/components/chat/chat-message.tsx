"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import type { AIResponse } from "./ai-response-renderer";
import { AIResponseRenderer } from "./ai-response-renderer";

export interface ContentOutline {
  title: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

export interface ChatMessageProps {
  type: "user" | "ai";
  content: string | AIResponse;
  timestamp: Date;
  isLoading?: boolean;
  isStreaming?: boolean;
  onQuestionSelect?: (question: string) => void;
}

export function ChatMessage({
  type,
  content,
  timestamp,
  isLoading = false,
  isStreaming = false,
  onQuestionSelect,
}: ChatMessageProps) {
  const isAI = type === "ai";
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
  }).format(timestamp);

  return (
    <div
      className={cn(
        "flex w-full gap-3 px-4 py-6",
        isAI ? "bg-muted/30 rounded-2xl" : "bg-background",
        !isAI && "flex-row-reverse",
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8">
        {isAI ? (
          <>
            <AvatarFallback>AI</AvatarFallback>
            <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
          </>
        ) : (
          <>
            <AvatarFallback>U</AvatarFallback>
            <AvatarImage src="/user-avatar.png" alt="User" />
          </>
        )}
      </Avatar>

      {/* Message content */}
      <div className={cn("flex-1 space-y-2", !isAI && "text-right")}>
        <div className={cn("flex items-center gap-2", !isAI && "justify-end")}>
          <span className="font-medium">{isAI ? "InsightSpark" : "You"}</span>
          <span className="text-muted-foreground text-xs">{formattedTime}</span>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <LoadingMessage />
          ) : typeof content === "string" ? (
            <div className={cn("flex items-start", !isAI && "justify-end")}>
              <p className="whitespace-pre-wrap">{content}</p>
              {isStreaming && (
                <span className="text-primary ml-1 animate-pulse">▋</span>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <AIResponseRenderer
                response={content}
                onQuestionSelect={onQuestionSelect}
              />
              {isStreaming && (
                <span className="text-primary animate-pulse">▋</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingMessage() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
      <div className="bg-primary animation-delay-200 h-2 w-2 animate-pulse rounded-full"></div>
      <div className="bg-primary animation-delay-400 h-2 w-2 animate-pulse rounded-full"></div>
      <span className="text-muted-foreground ml-2 text-sm">Processing...</span>
    </div>
  );
}
