"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/client";
import styles from "./marketing.module.css";

// "Log in · Start free" for visitors, "Open editor" once signed in. Checked in
// the browser so the marketing pages stay cacheable.
export function useSignedIn(): boolean {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session?.user)));
    return () => subscription.unsubscribe();
  }, []);
  return signedIn;
}

export function AccountLinks() {
  const signedIn = useSignedIn();
  if (signedIn) {
    return (
      <Link href="/editor" className={`${styles.btn} ${styles.btnDark} ${styles.navCta}`}>
        Open editor
      </Link>
    );
  }
  return (
    <>
      <Link href="/auth/login">Log in</Link>
      <Link href="/auth/signup" className={`${styles.btn} ${styles.btnDark} ${styles.navCta}`}>
        Start free
      </Link>
    </>
  );
}
