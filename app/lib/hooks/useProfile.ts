"use client";

import { useEffect, useState, useCallback } from "react";
import { BlockLayout, BlockContent, ThemeId } from "@/app/lib/types";

function normalizeTheme(theme: unknown): ThemeId {
  return theme === "light" ? "light" : "dark";
}

interface ProfileData {
  id: string;
  username: string;
  avatarUrl?: string | null;
  theme: ThemeId;
  layout: BlockLayout[];
  content: Record<string, BlockContent>;
  isPro: boolean;
  customDomain?: string | null;
}

interface UseProfileReturn {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  saveProfile: (
    updates: Partial<
      Pick<
        ProfileData,
        "layout" | "content" | "theme" | "customDomain" | "avatarUrl"
      >
    >
  ) => Promise<void>;
  saving: boolean;
  // Pro access comes from the profile record, not admin status.
  hasProAccess: boolean;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile");

        if (!response.ok) {
          if (response.status === 401) {
            setError("Not authenticated");
          } else {
            const data = await response.json();
            setError(data.error || "Failed to load profile");
          }
          return;
        }

        const data = await response.json();
        setProfile({
          id: data.id,
          username: data.username,
          avatarUrl: data.avatar_url || null,
          theme: normalizeTheme(data.theme),
          layout: data.layout || [],
          content: data.content || {},
          isPro: data.is_pro || false,
          customDomain: data.custom_domain || null,
        });
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const saveProfile = useCallback(
    async (
      updates: Partial<
        Pick<
          ProfileData,
          "layout" | "content" | "theme" | "customDomain" | "avatarUrl"
        >
      >
    ) => {
      setSaving(true);
      setError(null);

      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to save");
        }

        // Update local state
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                ...updates,
              }
            : null
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const hasProAccess = Boolean(profile?.isPro);

  return { profile, loading, error, saveProfile, saving, hasProAccess };
}
