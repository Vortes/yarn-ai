"use client";

import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Send } from "lucide-react";
import { ShineBorder } from "../magicui/shine-border";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [shineOpacity, setShineOpacity] = useState(0);

  useEffect(() => {
    // Ease in animation - start immediately
    const fadeInTimer = setTimeout(() => {
      setShineOpacity(1);
    }, 100);

    // Start fade out after 8 seconds
    const fadeOutTimer = setTimeout(() => {
      setShineOpacity(0);
    }, 8000);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-background-secondary relative mx-auto w-8/12 overflow-hidden rounded-t-lg border border-b-0 p-4 backdrop-blur-3xl">
      <ShineBorder
        shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        style={{
          opacity: shineOpacity,
          transition: "opacity 1s ease-out",
        }}
      />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-4">
        {/* Input area */}
        <div className="flex items-end gap-2">
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
        </div>
      </div>
    </div>
  );
}
