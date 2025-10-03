"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { env } from "@/lib/env";

const ANNOUNCEMENT_ID = env.NEXT_PUBLIC_ANNOUNCEMENT_ID || "alpha-v1"; // bump to show again on new announcements
const ANNOUNCEMENT_STORAGE_KEY = `app-announcement:${ANNOUNCEMENT_ID}`;
const ANNOUNCEMENT_TTL_DAYS = env.NEXT_PUBLIC_ANNOUNCEMENT_TTL_DAYS || 30; // redisplay after TTL even if dismissed

export function AnnouncementBanner() {
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  // Check if announcement has been dismissed (with TTL)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
      if (!raw) {
        setShowAnnouncement(true);
        return;
      }
      const payload = JSON.parse(raw) as { dismissedAt: number } | null;
      if (!payload?.dismissedAt) {
        setShowAnnouncement(true);
        return;
      }
      const ageMs = Date.now() - payload.dismissedAt;
      const ttlMs = ANNOUNCEMENT_TTL_DAYS * 24 * 60 * 60 * 1000;
      setShowAnnouncement(ageMs > ttlMs);
    } catch {
      setShowAnnouncement(true);
    }
  }, []);

  const handleDismissAnnouncement = () => {
    try {
      localStorage.setItem(
        ANNOUNCEMENT_STORAGE_KEY,
        JSON.stringify({ dismissedAt: Date.now() })
      );
    } catch {}
    setShowAnnouncement(false);
  };

  const title = env.NEXT_PUBLIC_ANNOUNCEMENT_TITLE?.trim();
  const message = env.NEXT_PUBLIC_ANNOUNCEMENT_MESSAGE?.trim();
  const hasContent = Boolean(title || message);

  if (!showAnnouncement || !hasContent) {
    return null;
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Alert className="relative border-0 bg-transparent py-2 sm:py-2.5 pl-4 pr-14 sm:pr-16">
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <span aria-hidden className="mr-2">⚠️</span>
            {title && <span className="font-semibold">{title}: </span>}
            {message}
          </AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-8 sm:w-8 p-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 hover:bg-amber-500/10"
            onClick={handleDismissAnnouncement}
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss announcement</span>
          </Button>
        </Alert>
      </div>
    </div>
  );
}

