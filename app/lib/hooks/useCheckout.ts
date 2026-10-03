"use client";

import { useState } from "react";
import { startCheckout } from "@/app/lib/checkout-client";
import { useAuth } from "./useAuth";

// Opens Lemon Squeezy's checkout on top of the page (or the full checkout
// page if its script can't load). A beta or reward code turns Pro on
// straight away.
export function useCheckout() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateCheckout = async (discountCode?: string) => {
    if (!user) {
      setError("You must be logged in to upgrade");
      return;
    }
    setLoading(true);
    setError(null);
    const message = await startCheckout(discountCode);
    if (message) setError(message);
    setLoading(false);
  };

  return { initiateCheckout, loading, error };
}
