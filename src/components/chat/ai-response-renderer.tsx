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

export function ChatMessage({ type, content }: ChatMessageProps) {
  const isAI = type === "ai";

  return (
    <div
      className={cn("flex w-full gap-3 px-4 py-6", !isAI && "flex-row-reverse")}
    >
      {/* Message content */}
      <div className={cn("flex-1 space-y-2", !isAI && "text-right")}>
        <div className="space-y-4">
          {typeof content === "string" ? (
            <div className={cn("flex items-start", !isAI && "justify-end")}>
              <p className="whitespace-pre-wrap">{content}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-card-foreground">{content.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
