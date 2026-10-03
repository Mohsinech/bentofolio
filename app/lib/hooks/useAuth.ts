"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { isAdmin } from "@/app/lib/config";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  githubUsername: string | null;
  isAdmin: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let active = true;
    // The saved session is read locally, so pages can show right away; the
    // server then confirms it (and signs out a session that's no longer valid).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Get GitHub username from identities or user metadata
  const getGithubUsername = () => {
    // First check if there's a GitHub identity
    const githubIdentity = user?.identities?.find(
      (identity) => identity.provider === "github"
    );

    if (githubIdentity?.identity_data?.user_name) {
      return githubIdentity.identity_data.user_name as string;
    }

    if (githubIdentity?.identity_data?.preferred_username) {
      return githubIdentity.identity_data.preferred_username as string;
    }

    // Fallback to user_metadata (for users who signed up directly with GitHub)
    return (
      user?.user_metadata?.user_name ||
      user?.user_metadata?.preferred_username ||
      null
    );
  };

  const githubUsername = getGithubUsername();

  // Check if user is admin
  const userIsAdmin = isAdmin(user?.email, githubUsername);

  return {
    user,
    loading,
    signOut,
    githubUsername,
    isAdmin: userIsAdmin,
  };
}
