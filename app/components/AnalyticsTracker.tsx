"use client";

import { useEffect } from "react";

interface AnalyticsTrackerProps {
  username: string;
  // Kept for callers; every page is tracked, Pro decides who sees the numbers.
  isPro?: boolean;
}

function send(body: Record<string, unknown>) {
  // keepalive lets a click be recorded even when the visitor leaves the page.
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {
    // Analytics never breaks the page.
  });
}

export function AnalyticsTracker({ username }: AnalyticsTrackerProps) {
  useEffect(() => {
    send({ username, event: "view", referrer: document.referrer || null });

    // Clicks on links that leave the page, with the block they were in.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest("a");
      if (!link?.href) return;
      let url: URL;
      try {
        url = new URL(link.href);
      } catch {
        return;
      }
      const external = url.protocol === "mailto:" || (url.protocol.startsWith("http") && url.hostname !== window.location.hostname);
      if (!external) return;
      const block = (link.closest("[data-block]") as HTMLElement | null)?.dataset.block ?? null;
      send({ username, event: "link_click", clicked_url: link.href, block, referrer: document.referrer || null });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [username]);

  return null;
}
