"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertCircle } from "lucide-react";

const ANNOUNCEMENT_STORAGE_KEY = "app-announcement-dismissed";

export function AnnouncementBanner() {
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  // Check if announcement has been dismissed
  useEffect(() => {
    const isDismissed = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
    setShowAnnouncement(!isDismissed);
  }, []);

  const handleDismissAnnouncement = () => {
    localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "true");
    setShowAnnouncement(false);
  };

  if (!showAnnouncement) {
    return null;
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Alert className="relative border-0 bg-transparent p-4">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <span className="font-semibold">Alpha Release:</span> This is an early version of the product. Some features may be experimental or subject to change.
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-3 h-6 w-6 p-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
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

