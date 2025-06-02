"use client";

import React from "react";

export interface WaveformVisualizerProps {
  audioStream: MediaStream | null;
  isRecording: boolean;
}

export function WaveformVisualizer({
  audioStream,
  isRecording,
}: WaveformVisualizerProps) {
  // Placeholder for waveform
  return (
    <div className="bg-muted flex h-8 w-full items-center justify-center rounded">
      <span className="text-muted-foreground text-xs">
        {isRecording ? "Waveform..." : "Not recording"}
      </span>
    </div>
  );
}
