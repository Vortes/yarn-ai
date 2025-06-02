"use client";

import React from "react";
import { cn } from "~/lib/utils";

export type UserTier = "anonymous" | "free" | "premium";

interface SessionCounterProps {
  used: number;
  total: number;
  tier: UserTier;
}

export function SessionCounter({ used, total, tier }: SessionCounterProps) {
  const percentage = Math.min(100, Math.round((used / total) * 100));
  const remaining = total - used;

  return (
    <div className="flex items-center gap-2">
      <div className="bg-muted flex h-5 w-24 overflow-hidden rounded-full">
        <div
          className={cn(
            "h-full transition-all duration-500",
            tier === "premium"
              ? "bg-primary"
              : percentage > 80
                ? "bg-destructive"
                : "bg-primary",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="text-xs font-medium">
        {tier === "premium" ? (
          "Premium"
        ) : (
          <>
            {remaining} session{remaining !== 1 ? "s" : ""} left
          </>
        )}
      </span>
    </div>
  );
}
