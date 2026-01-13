"use client";

import { useEffect } from "react";

interface AnalyticsTrackerProps {
  username: string;
  isPro: boolean;
}

export function AnalyticsTracker({ username, isPro }: AnalyticsTrackerProps) {
  useEffect(() => {
    // Only track for Pro users
    if (!isPro) return;

    // Track page view
    const trackView = async () => {
      try {
        await fetch("/api/analytics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            event: "view",
            referrer: document.referrer || null,
            userAgent: navigator.userAgent,
          }),
        });
      } catch (error) {
        // Silently fail - analytics shouldn't break the page
        console.error("Analytics error:", error);
      }
    };

    trackView();
  }, [username, isPro]);

  // This component doesn't render anything
  return null;
}
