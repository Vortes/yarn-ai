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
import {
  ChatInput,
  type TherapeuticFramework,
} from "~/components/chat/chat-input";
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
    framework: "Cognitive Behavioral",
  },
  {
    id: "2",
    title: "Follow-up session",
    date: new Date("2025-06-03"),
    framework: "Mindfulness-Based",
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
  const [streamingAudioUrl, setStreamingAudioUrl] = useState<string | null>(
    null,
  );
  const [streamingText, setStreamingText] = useState<{
    text: string;
    framework: string;
  } | null>(null);
  const [streamingResponse, setStreamingResponse] = useState<string>("");
  const [isStreamingActive, setIsStreamingActive] = useState(false);

  // Get current user data
  const { user } = useUser();

  // tRPC hooks
  const transcribe = api.audio.transcribe.useMutation();
  const synthesize = api.synthesis.generateInitialInsights.useMutation();
  const generateOutline = api.outline.generateContentOutline.useMutation();

  // SSE subscription for audio processing
  api.audio.processAudioStream.useSubscription(
    streamingAudioUrl
      ? {
          audioFileUrl: streamingAudioUrl,
          isPremium: false, // TODO: Get from user subscription status
        }
      : skipToken,
    {
      onData: (update) => {
        switch (update.type) {
          case "uploading":
            break;
          case "transcribing":
            break;
          case "analyzing":
            break;
          case "generating":
            setIsStreamingActive(true);
            setStreamingResponse("");
            break;
          case "streaming_summary":
            if (!update.isComplete) {
              setStreamingResponse((prev) => prev + update.chunk);
            } else {
              setIsStreamingActive(false);
            }
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
            setStreamingAudioUrl(null);
            setStreamingResponse("");
            break;
          case "error":
            setIsProcessing(false);
            setStreamingAudioUrl(null);
            setIsStreamingActive(false);
            setStreamingResponse("");
            toast.error(update.error);
            break;
        }
      },
      onError: (error) => {
        setIsProcessing(false);
        setStreamingAudioUrl(null);
        setIsStreamingActive(false);
        setStreamingResponse("");
        toast.error(error.message || "Streaming failed");
      },
    },
  );

  // SSE subscription for text processing
  api.text.processTextStream.useSubscription(
    streamingText
      ? { text: streamingText.text, framework: streamingText.framework }
      : skipToken,
    {
      onData: (update) => {
        switch (update.type) {
          case "analyzing":
            break;
          case "generating":
            setIsStreamingActive(true);
            setStreamingResponse("");
            break;
          case "streaming_summary":
            if (!update.isComplete) {
              setStreamingResponse((prev) => prev + update.chunk);
            } else {
              setIsStreamingActive(false);
            }
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

  const handleSendMessage = (
    message: string,
    framework: TherapeuticFramework,
  ) => {
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

    // Start AI processing with streaming
    setIsProcessing(true);
    setStreamingText({ text: message, framework });
  };

  // Mock upload step
  const mockUpload = async (file: Blob) => {
    await new Promise((res) => setTimeout(res, 1200));
    return "https://mock.upload/audio-file.webm";
  };

  // Audio input async flow with SSE streaming
  const handleSendAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // 1. Mock upload
      const fileUrl = await mockUpload(audioBlob);

      // 2. Start SSE streaming by setting the URL
      setStreamingAudioUrl(fileUrl);
    } catch (err: unknown) {
      setIsProcessing(false);
      const errorMessage =
        err instanceof Error ? err.message : "Audio processing failed";
      toast.error(errorMessage);
    }
  };

  // Outline generation async flow
  const handleGenerateOutline = async () => {
    setIsProcessing(true);
    try {
      // For demo, just use the last AI summary
      const lastAI = [...messages]
        .reverse()
        .find(
          (m) =>
            m.type === "ai" &&
            typeof m.content === "object" &&
            m.content.summary,
        );
      const summary =
        lastAI && typeof lastAI.content === "object" && lastAI.content.summary
          ? lastAI.content.summary
          : "Conversation summary";
      const outlineRes = await generateOutline.mutateAsync({
        conversationSummary: summary,
      });
      if (!outlineRes.success || !outlineRes.outline)
        throw new Error(outlineRes.error ?? "Outline generation failed");
      setOutline({
        title: "Generated Outline",
        sections: [
          { heading: "Hook", content: outlineRes.outline.hook ?? "" },
          {
            heading: "Main Points",
            content: Array.isArray(outlineRes.outline.mainPoints)
              ? outlineRes.outline.mainPoints.join("\n")
              : "",
          },
          outlineRes.outline.callToAction
            ? {
                heading: "Call to Action",
                content: outlineRes.outline.callToAction,
              }
            : undefined,
          {
            heading: "Visual Ideas",
            content: Array.isArray(outlineRes.outline.visualIdeas)
              ? outlineRes.outline.visualIdeas.join("\n")
              : "",
          },
        ].filter((section): section is { heading: string; content: string } =>
          Boolean(section?.content),
        ),
      });
      setShowOutline(true);
      setIsProcessing(false);
    } catch (err) {
      setIsProcessing(false);
      const errorMsg =
        err instanceof Error ? err.message : "Outline generation failed";
      toast.error(errorMsg);
    }
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
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendAudio={handleSendAudio}
        />
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
