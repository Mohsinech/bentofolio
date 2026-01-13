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
  // Admin gets pro features automatically
  hasProAccess: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
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
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Get GitHub username from user metadata
  const githubUsername =
    user?.user_metadata?.user_name ||
    user?.user_metadata?.preferred_username ||
    null;

  // Check if user is admin
  const userIsAdmin = isAdmin(user?.email, githubUsername);

  return {
    user,
    loading,
    signOut,
    githubUsername,
    isAdmin: userIsAdmin,
    hasProAccess: userIsAdmin, // Admins get pro access
  };
}
