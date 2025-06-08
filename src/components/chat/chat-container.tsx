"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ScrollArea } from "~/components/ui/scroll-area";
import { MainChatLayout } from "~/components/chat/main-chat-layout";
import {
  SessionSidebar,
  type ChatSession,
} from "~/components/chat/session-sidebar";
import { ChatInput } from "~/components/chat/chat-input";
import { ChatMessage } from "./chat-message";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { skipToken } from "@tanstack/react-query";

// Mock data for initial UI
const mockSessions: ChatSession[] = [
  {
    id: "1",
    title: "First conversation",
    date: new Date("2025-06-01"),
  },
  {
    id: "2",
    title: "Follow-up session",
    date: new Date("2025-06-03"),
  },
];

export function ChatContainer() {
  // Chat state
  type AIResponse = {
    summary?: string;
    questions?: string[];
  };
  type UserMessage = {
    id: string;
    type: "user";
    content: string;
    timestamp: Date;
  };
  type AIMessage = {
    id: string;
    type: "ai";
    content: AIResponse;
    timestamp: Date;
  };

  const [messages, setMessages] = useState<(UserMessage | AIMessage)[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Streaming state
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [streamingResponse, setStreamingResponse] = useState<string>("");
  const [isStreamingActive, setIsStreamingActive] = useState(false);

  // Get current user data
  const { user } = useUser();

  // SSE subscription for text processing
  api.text.processTextStream.useSubscription(
    streamingText ? { text: streamingText } : skipToken,
    {
      onData: (update) => {
        switch (update.type) {
          case "thinking":
            setIsStreamingActive(true);
            setStreamingResponse("");
            break;
          case "streaming":
            setStreamingResponse((prev) => prev + update.chunk);
            break;
          case "complete":
            setIsStreamingActive(false);
            // Add AI response to chat
            if (update.result) {
              setMessages((msgs) => [
                ...msgs,
                {
                  id: Date.now().toString() + "-ai",
                  type: "ai",
                  content: {
                    summary: update.result.summary,
                    questions: update.result.questions,
                  },
                  timestamp: new Date(),
                },
              ]);
            }
            setIsProcessing(false);
            setStreamingText(null);
            setStreamingResponse("");
            break;
          case "error":
            setIsProcessing(false);
            setStreamingText(null);
            setIsStreamingActive(false);
            setStreamingResponse("");
            toast.error(update.error);
            break;
        }
      },
      onError: (error) => {
        setIsProcessing(false);
        setStreamingText(null);
        setIsStreamingActive(false);
        setStreamingResponse("");
        toast.error(error.message || "Streaming failed");
      },
    },
  );

  // Event handlers
  const handleSessionSelect = (sessionId: string) => {
    console.log(`Selected session: ${sessionId}`);
  };

  const handleNewSession = () => {
    console.log("Creating new session");
  };

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    setMessages((msgs) => [
      ...msgs,
      {
        id: Date.now().toString(),
        type: "user",
        content: message,
        timestamp: new Date(),
      },
    ]);

    // Start streaming
    setIsProcessing(true);
    setStreamingText(message);
  };

  return (
    <MainChatLayout
      sidebarContent={
        <SessionSidebar
          sessions={mockSessions}
          currentSessionId="2"
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewSession}
        />
      }
    >
      {/* Chat messages area - takes remaining space */}
      <ScrollArea className="h-full flex-1">
        <div className="mx-auto max-w-4xl space-y-4 p-4">
          {messages.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="space-y-4 text-center">
                <div className="text-foreground/80 text-3xl font-bold">
                  How can I help you ideate?
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  type={message.type}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}

              {/* Streaming AI response */}
              {isStreamingActive && streamingResponse && (
                <ChatMessage
                  key="streaming"
                  type="ai"
                  content={{ summary: streamingResponse }}
                  timestamp={new Date()}
                />
              )}
            </>
          )}
        </div>
        {/* Chat input area - always visible at bottom */}
        <div className="absolute bottom-0 w-full">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isProcessing}
          />
        </div>
      </ScrollArea>
    </MainChatLayout>
  );
}
