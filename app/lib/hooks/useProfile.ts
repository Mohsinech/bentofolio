"use client";

import { useEffect, useState, useCallback } from "react";
import { BlockLayout, BlockContent, ThemeId } from "@/app/lib/types";

function normalizeTheme(theme: unknown): ThemeId {
  return theme === "light" ? "light" : "dark";
}

interface PageState {
  layout: BlockLayout[];
  content: Record<string, BlockContent>;
  theme: ThemeId;
  // 1 = old fixed template (order only), 2 = bento grid positions.
  layoutVersion: number;
}

function layoutVersionOf(value: unknown): number {
  return typeof value === "number" ? value : 1;
}

interface ProfileData extends PageState {
  // layout / content / theme above are the editor's working copy: the saved
  // draft when there is one, otherwise the live page.
  id: string;
  username: string;
  avatarUrl?: string | null;
  isPro: boolean;
  customDomain?: string | null;
  // What visitors currently see.
  published: PageState;
  publishedAt: string | null;
}

interface UseProfileReturn {
  profile: ProfileData | null;
  loading: boolean;
  // Only set when the profile could not be loaded. A failed save never sets
  // this, so the editor stays open and unsaved changes stay on screen.
  error: string | null;
  // Set when the last save failed; cleared when a save starts or succeeds.
  saveError: string | null;
  saveProfile: (
    updates: Partial<
      Pick<
        ProfileData,
        "layout" | "content" | "theme" | "layoutVersion" | "customDomain" | "avatarUrl"
      >
    >
  ) => Promise<void>;
  saving: boolean;
  // Copies the saved draft to the live page.
  publishProfile: () => Promise<void>;
  // Changes the page address. Returns a message the dialog can show.
  updateUsername: (username: string) => Promise<{ ok: boolean; message?: string }>;
  publishing: boolean;
  // Pro access comes from the profile record, not admin status.
  hasProAccess: boolean;
}

// Turns a failed save response into a message a person can act on. The body
// is not always JSON (a host returns plain text for oversized requests), so
// never assume it parses.
async function describeSaveFailure(response: Response): Promise<string> {
  if (response.status === 413) {
    return "Your page is too large to save. Try smaller images.";
  }
  if (response.status === 401) {
    return "You were signed out. Sign in again in another tab, then save.";
  }

  try {
    const data = await response.json();
    if (data && typeof data.error === "string" && data.error) {
      return data.error;
    }
  } catch {
    // Not JSON: fall through to the generic message.
  }

  return "Couldn't save. Your changes are still here.";
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

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
        const published: PageState = {
          layout: data.layout || [],
          content: data.content || {},
          theme: normalizeTheme(data.theme),
          layoutVersion: layoutVersionOf(data.layout_version),
        };
        const draft: PageState | null = data.draft
          ? {
              layout: data.draft.layout || [],
              content: data.draft.content || {},
              theme: normalizeTheme(data.draft.theme),
              layoutVersion: layoutVersionOf(data.draft.layout_version),
            }
          : null;
        setProfile({
          id: data.id,
          username: data.username,
          avatarUrl: data.avatar_url || null,
          ...(draft ?? published),
          isPro: data.is_pro || false,
          customDomain: data.custom_domain || null,
          published,
          publishedAt: data.published_at || null,
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
          "layout" | "content" | "theme" | "layoutVersion" | "customDomain" | "avatarUrl"
        >
      >
    ) => {
      setSaving(true);
      setSaveError(null);

      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(await describeSaveFailure(response));
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
        const message =
          err instanceof TypeError
            ? "You seem to be offline. Your changes are still here."
            : err instanceof Error
              ? err.message
              : "Couldn't save. Your changes are still here.";
        setSaveError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const publishProfile = useCallback(async () => {
    setPublishing(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/profile/publish", { method: "POST" });
      if (!response.ok) {
        throw new Error(await describeSaveFailure(response));
      }
      const data = await response.json().catch(() => ({}));

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              published: {
                layout: prev.layout,
                content: prev.content,
                theme: prev.theme,
                layoutVersion: prev.layoutVersion,
              },
              publishedAt: data.publishedAt || prev.publishedAt,
            }
          : null
      );
    } catch (err) {
      const message =
        err instanceof TypeError
          ? "You seem to be offline. Nothing was published."
          : err instanceof Error
            ? err.message
            : "Couldn't publish. Try again.";
      setSaveError(message);
      throw new Error(message);
    } finally {
      setPublishing(false);
    }
  }, []);

  const updateUsername = useCallback(async (username: string) => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (!response.ok) {
        return { ok: false, message: await describeSaveFailure(response) };
      }
      setProfile((prev) => (prev ? { ...prev, username } : null));
      return { ok: true };
    } catch {
      return { ok: false, message: "You seem to be offline. Try again." };
    }
  }, []);

  const hasProAccess = Boolean(profile?.isPro);

  return {
    profile,
    loading,
    error,
    saveError,
    saveProfile,
    saving,
    publishProfile,
    publishing,
    updateUsername,
    hasProAccess,
  };
}
