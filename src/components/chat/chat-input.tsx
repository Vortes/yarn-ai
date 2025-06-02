"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { AudioRecorder } from "../audio/audio-recorder";
import { toast } from "sonner";

export type TherapeuticFramework =
  | "cognitive-behavioral"
  | "psychodynamic"
  | "humanistic"
  | "mindfulness"
  | "solution-focused";

interface ChatInputProps {
  onSendMessage: (message: string, framework: TherapeuticFramework) => void;
  onSendAudio?: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  onSendAudio,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "audio">("text");
  const [selectedFramework, setSelectedFramework] =
    useState<TherapeuticFramework>("cognitive-behavioral");

  const frameworks: { value: TherapeuticFramework; label: string }[] = [
    { value: "cognitive-behavioral", label: "Cognitive Behavioral" },
    { value: "psychodynamic", label: "Psychodynamic" },
    { value: "humanistic", label: "Humanistic" },
    { value: "mindfulness", label: "Mindfulness-Based" },
    { value: "solution-focused", label: "Solution-Focused" },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message, selectedFramework);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleInputMode = () => {
    setInputMode(inputMode === "text" ? "audio" : "text");
  };

  // Audio integration handlers
  const handleRecordingComplete = (audioBlob: Blob) => {
    if (onSendAudio) onSendAudio(audioBlob);
    toast.success("Audio recorded");
  };
  const handleTimeWarning = (remaining: number) => {
    toast.error(`Only ${remaining} seconds left!`, { duration: 3000 });
  };

  return (
    <div className="bg-background border-t p-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        {/* Framework selector */}
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Framework:{" "}
                {frameworks.find((f) => f.value === selectedFramework)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {frameworks.map((framework) => (
                <DropdownMenuItem
                  key={framework.value}
                  onClick={() => setSelectedFramework(framework.value)}
                >
                  {framework.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Input mode toggle */}
          {onSendAudio && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleInputMode}
              className="text-xs"
            >
              Switch to {inputMode === "text" ? "audio" : "text"} input
            </Button>
          )}
        </div>

        {/* Input area */}
        <div className="flex items-end gap-2">
          {inputMode === "text" ? (
            <>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[80px] flex-1 resize-none"
                disabled={disabled}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || disabled}
                size="icon"
                className="h-10 w-10 shrink-0"
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </>
          ) : (
            <div className="flex w-full flex-col gap-4">
              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDuration={300}
                onTimeWarning={handleTimeWarning}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
