"use client";

import React from "react";
import { cn } from "~/lib/utils";

export interface ContentOutline {
  title: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

export interface AIResponse {
  summary?: string;
  questions?: string[];
  outline?: ContentOutline;
}

export interface ChatMessageProps {
  type: "user" | "ai";
  content: string | AIResponse;
  timestamp: Date;
  onQuestionSelect?: (question: string) => void;
}

export interface AIResponseRendererProps {
  response: AIResponse;
  onQuestionSelect?: (question: string) => void;
}

export function AIResponseRenderer({ response }: AIResponseRendererProps) {
  return (
    <div className="space-y-4">
      {response.summary && (
        <div className="bg-card rounded-lg p-4">
          <h3 className="mb-2 font-medium">Summary</h3>
          <p className="text-card-foreground">{response.summary}</p>
        </div>
      )}
    </div>
  );
}

export function ChatMessage({ type, content, timestamp }: ChatMessageProps) {
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
      {/* Message content */}
      <div className={cn("flex-1 space-y-2", !isAI && "text-right")}>
        <div className={cn("flex items-center gap-2", !isAI && "justify-end")}>
          <span className="font-medium">{isAI ? "" : "You"}</span>
          <span className="text-muted-foreground text-xs">{formattedTime}</span>
        </div>

        <div className="space-y-4">
          {typeof content === "string" ? (
            <div className={cn("flex items-start", !isAI && "justify-end")}>
              <p className="whitespace-pre-wrap">{content}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AIResponseRenderer response={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
