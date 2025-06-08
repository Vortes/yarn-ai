"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ScrollArea } from "~/components/ui/scroll-area";
import { MainChatLayout } from "~/components/chat/main-chat-layout";
import {
  SessionSidebar,
  type ChatSession,
} from "~/components/chat/session-sidebar";
import { ChatMessage } from "~/components/chat/chat-message";
import { ChatInput } from "~/components/chat/chat-input";
import { SessionCounter } from "~/components/ui/session-counter";
import { UserProfile } from "~/components/auth/user-profile";
import { ContentOutlineDisplay } from "./content-outline-display";
import type { ContentOutline } from "./content-outline-display";
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
    outline?: ContentOutline;
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
  const [showOutline, setShowOutline] = useState(false);
  const [outline, setOutline] = useState<ContentOutline | null>(null);

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

  // Outline generation - simplified
  const handleGenerateOutline = async () => {
    toast.error("Outline generation not yet implemented");
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
      headerContent={
        <div className="flex items-center gap-4">
          <SessionCounter used={2} total={5} tier="free" />
          <UserProfile />
        </div>
      }
    >
      {/* Chat messages area - takes remaining space */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto max-w-4xl space-y-4 p-4">
          {messages.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="space-y-4 text-center">
                <div className="text-foreground text-3xl font-bold">
                  How can I help you ideate
                  {user?.firstName ? `, ${user.firstName}` : ""}?
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
                  isStreaming={true}
                />
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Outline display */}
      {showOutline && outline && (
        <div className="mx-auto max-w-4xl p-4">
          <ContentOutlineDisplay
            outline={outline}
            onEdit={() => {
              /* TODO: implement editing */
            }}
            onExport={(format) => alert(`Export as ${format}`)}
          />
        </div>
      )}

      {/* Chat input area - always visible at bottom */}
      <div className="flex-shrink-0">
        <ChatInput onSendMessage={handleSendMessage} disabled={isProcessing} />
        <div className="mt-2 flex justify-end gap-2">
          <button
            className="text-xs underline"
            onClick={handleGenerateOutline}
            disabled={isProcessing}
          >
            Generate Outline
          </button>
        </div>
      </div>
    </MainChatLayout>
  );
}
