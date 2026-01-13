"use client";

import { useState } from "react";
import { useAuth } from "./useAuth";

export function useCheckout() {
  const { user, githubUsername } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateCheckout = async () => {
    if (!user) {
      setError("You must be logged in to upgrade");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          username: githubUsername,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checkout");
      }

      const { url } = await response.json();

      // Redirect to Lemon Squeezy checkout
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return {
    initiateCheckout,
    loading,
    error,
  };
}
