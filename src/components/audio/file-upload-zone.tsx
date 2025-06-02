"use client";

import React, { useRef } from "react";
import { Button } from "~/components/ui/button";

export interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  maxFileSize: number;
  acceptedFormats: string[];
}

export function FileUploadZone({
  onFileSelect,
  maxFileSize,
  acceptedFormats,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxFileSize) {
      alert("File too large");
      return;
    }
    if (!acceptedFormats.some((fmt) => file.name.endsWith(fmt))) {
      alert("Unsupported file type");
      return;
    }
    onFileSelect(file);
  };

  return (
    <div className="flex flex-col items-center gap-2 rounded border p-4">
      <input
        ref={inputRef}
        type="file"
        accept={acceptedFormats.map((f) => "." + f).join(",")}
        className="hidden"
        onChange={handleFileChange}
      />
      <Button onClick={() => inputRef.current?.click()}>
        Upload Audio File
      </Button>
      <div className="text-muted-foreground text-xs">
        Max size: {Math.round(maxFileSize / 1024 / 1024)}MB
      </div>
      <div className="text-muted-foreground text-xs">
        Accepted: {acceptedFormats.join(", ")}
      </div>
    </div>
  );
}
