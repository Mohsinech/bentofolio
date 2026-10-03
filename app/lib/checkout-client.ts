"use client";

// Opens Lemon Squeezy's checkout on top of the current page. If its script
// can't load (blocked, offline), falls back to the full checkout page.

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Setup: (options: { eventHandler: (event: { event: string; data?: { id?: string | number } }) => void }) => void;
      Url: { Open: (url: string) => void; Close: () => void };
    };
  }
}

const SCRIPT_SRC = "https://app.lemonsqueezy.com/js/lemon.js";
let loading: Promise<boolean> | null = null;

function loadLemon(): Promise<boolean> {
  if (window.LemonSqueezy) return Promise.resolve(true);
  loading ??= new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.defer = true;
    const timer = window.setTimeout(() => resolve(false), 5000);
    script.onload = () => {
      window.clearTimeout(timer);
      try {
        window.createLemonSqueezy?.();
        resolve(Boolean(window.LemonSqueezy));
      } catch {
        resolve(false);
      }
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      resolve(false);
    };
    document.head.appendChild(script);
  }).then((ok) => {
    if (!ok) loading = null;
    return ok;
  });
  return loading;
}

export function successUrl(orderId?: string | number | null): string {
  return orderId ? `/upgrade/success?order=${encodeURIComponent(String(orderId))}` : "/upgrade/success";
}

// Starts checkout. Resolves with an error message, or never resolves on
// success (the page navigates away or the overlay takes over).
export async function startCheckout(discountCode?: string): Promise<string | null> {
  let data: { url?: string; upgraded?: boolean; error?: string };
  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discountCode: discountCode || undefined, embed: true }),
    });
    data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      window.location.href = "/auth/login";
      return null;
    }
    if (!response.ok) return data.error || "Couldn't open checkout. Try again.";
  } catch {
    return "Couldn't reach the server. Check your connection and try again.";
  }

  // A beta or reward code: Pro is already on.
  if (data.upgraded) {
    window.location.href = successUrl();
    return null;
  }
  if (!data.url) return "Couldn't open checkout. Try again.";

  // Only Lemon Squeezy pages open in the overlay; anything else (a
  // fallback payment link) opens as a page.
  let lemonPage = false;
  try {
    lemonPage = new URL(data.url).hostname.endsWith("lemonsqueezy.com");
  } catch {
    // Not a URL we can parse: open it as a page.
  }
  const overlay = lemonPage && (await loadLemon());
  if (!overlay || !window.LemonSqueezy) {
    window.location.href = data.url;
    return null;
  }
  window.LemonSqueezy.Setup({
    eventHandler: (event) => {
      if (event.event !== "Checkout.Success") return;
      window.LemonSqueezy?.Url.Close();
      window.location.href = successUrl(event.data?.id);
    },
  });
  window.LemonSqueezy.Url.Open(data.url);
  return null;
}
