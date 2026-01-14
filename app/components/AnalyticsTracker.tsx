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

    // Track link clicks
    const trackClick = async (url: string) => {
      try {
        await fetch("/api/analytics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            event: "link_click",
            clicked_url: url,
            referrer: document.referrer || null,
            userAgent: navigator.userAgent,
          }),
        });
      } catch (error) {
        console.error("Analytics error:", error);
      }
    };

    // Add click listener to all external links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      // Track clicks on external links (not same domain)
      if (link && link.href && !link.href.includes(window.location.hostname)) {
        trackClick(link.href);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [username, isPro]);

  // This component doesn't render anything
  return null;
}
