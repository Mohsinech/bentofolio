"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import styles from "../auth.module.css";

function getHashParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

export default function CompleteAuthPage() {
  const [message, setMessage] = useState("Confirming your account...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function completeAuth() {
      const supabase = createClient();
      const hashParams = getHashParams();
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setError("This confirmation link is missing its session tokens.");
        return;
      }

      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError || !data.session) {
        setError(sessionError?.message || "Could not finish signing you in.");
        return;
      }

      const couponCode =
        typeof data.user?.user_metadata?.beta_coupon_code === "string"
          ? data.user.user_metadata.beta_coupon_code
          : "";

      if (couponCode) {
        setMessage("Activating your beta Pro code...");
        await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discountCode: couponCode }),
        }).catch(() => null);
      }

      window.history.replaceState(null, "", "/auth/complete");
      window.location.replace("/editor");
    }

    completeAuth();
  }, []);

  return (
    <main className={styles.container}>
      <section className={`glass ${styles.card}`}>
        <div className={styles.header}>
          <h1 className={styles.logo}>
            Bento<span className={styles.logoAccent}>Folio</span>
          </h1>
          <h2 className={styles.title}>
            {error ? "Link needs a reset" : "Almost there"}
          </h2>
          <p className={styles.subtitle}>
            {error
              ? "The confirmation link opened, but we could not create your session."
              : message}
          </p>
        </div>

        {error ? (
          <>
            <div className={styles.error}>{error}</div>
            <Link href="/auth/login" className={styles.submitButton}>
              Back to login
            </Link>
          </>
        ) : (
          <div className={styles.success}>
            <Loader2 size={16} className={styles.spinner} />
            Setting up your BentoFolio.
          </div>
        )}
      </section>
    </main>
  );
}
