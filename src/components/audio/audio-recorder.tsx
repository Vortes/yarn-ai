"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Mic, Pause, StopCircle } from "lucide-react";

export interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration: number; // seconds
  onTimeWarning: (remainingSeconds: number) => void;
}

export function AudioRecorder({
  onRecordingComplete,
  maxDuration,
  onTimeWarning,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [chunks, setChunks] = useState<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaStream(stream);
      setMediaRecorder(recorder);
      setChunks([]);
      setElapsed(0);
      setIsRecording(true);
      recorder.start();
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setChunks((prev) => [...prev, e.data]);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        onRecordingComplete(blob);
        stream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
        setMediaRecorder(null);
        setChunks([]);
        setIsRecording(false);
        setElapsed(0);
      };
    } catch (err) {
      alert("Microphone access denied or not available.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  };

  // Timer logic
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next === maxDuration - 10) onTimeWarning(10);
          if (next === maxDuration - 60) onTimeWarning(60);
          if (next >= maxDuration) {
            stopRecording();
            return prev;
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, maxDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="flex w-48 flex-col items-center gap-2">
      {!isRecording ? (
        <Button onClick={startRecording} size="icon" variant="default">
          <Mic className="h-6 w-6" />
        </Button>
      ) : (
        <div className="flex w-full flex-col items-center gap-2">
          <div className="flex gap-2">
            <Button size="icon" variant="destructive" onClick={stopRecording}>
              <StopCircle className="h-6 w-6" />
            </Button>
            <Button size="icon" variant="outline" disabled>
              <Pause className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
