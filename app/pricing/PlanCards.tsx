"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/app/lib/hooks/useAuth";
import { useCheckout } from "@/app/lib/hooks/useCheckout";
import { useProfile } from "@/app/lib/hooks/useProfile";
import { PREMIUM_PRICE } from "@/app/lib/config";
import styles from "@/app/components/marketing/marketing.module.css";

const free = [
  "Every core block: profile, experience, projects, GitHub, skills, services and more",
  "SaaS block with verified revenue (Stripe or Lemon Squeezy)",
  "Drag-and-resize bento grid",
  "Grid and CV views",
  "Light and dark themes",
  "bentofolio.dev/yourname",
];

const pro: { text: string; soon?: boolean }[] = [
  { text: "Everything in Free" },
  { text: "Custom domain" },
  { text: "Analytics dashboard" },
  { text: "Spotify, YouTube and Instagram blocks" },
  { text: "Verified badge next to your name" },
  { text: "No “Made with bentofolio” tag" },
  { text: "Download your CV as a PDF" },
];

export function PlanCards() {
  const { user } = useAuth();
  const { hasProAccess } = useProfile();
  const { initiateCheckout, loading, error } = useCheckout();
  const [code, setCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("coupon")?.trim().toUpperCase() || "";
  });
  const normalized = code.trim().toUpperCase();

  function upgrade() {
    if (!user) {
      const url = new URL("/auth/signup", window.location.origin);
      if (normalized) url.searchParams.set("coupon", normalized);
      window.location.href = url.toString();
      return;
    }
    // Codes are checked on the server; the browser never knows which exist.
    initiateCheckout(normalized);
  }

  return (
    <section className={`${styles.sec} ${styles.narrow} ${styles.two}`}>
      <div className={`${styles.card} ${styles.bigPlan}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span className={styles.planName}>Free</span>
          <span className={styles.bigPrice}>
            $0<small>forever</small>
          </span>
          <p className={styles.p} style={{ fontSize: 15 }}>
            A complete, polished page on bentofolio.dev.
          </p>
        </div>
        <Link href={user ? "/editor" : "/auth/signup"} className={`${styles.btn} ${styles.btnGhost}`}>
          {user ? "Open editor" : "Start free"}
        </Link>
        <ul className={styles.features}>
          {free.map((item) => (
            <li key={item}>
              <Check size={16} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className={`${styles.card} ${styles.bigPlan} ${styles.planDark}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span className={styles.planName} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            Pro <span className={styles.pill}>LIFETIME BETA</span>
          </span>
          <span className={styles.bigPrice}>
            ${PREMIUM_PRICE}
            <small>once</small>
          </span>
          <p className={styles.planNote}>Your domain, your numbers, richer media.</p>
        </div>

        {!hasProAccess && (
          <label className={styles.code}>
            Have a code?
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Optional"
              spellCheck={false}
              autoComplete="off"
            />
          </label>
        )}

        <button
          type="button"
          className={`${styles.btn} ${styles.btnAccent}`}
          onClick={upgrade}
          disabled={loading || hasProAccess}
        >
          {loading ? (
            <Loader2 size={16} aria-label="Opening checkout" />
          ) : hasProAccess ? (
            <>
              <Check size={16} aria-hidden="true" /> Pro is active
            </>
          ) : normalized ? (
            "Apply code and get Pro"
          ) : (
            `Get Pro — $${PREMIUM_PRICE}`
          )}
        </button>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <ul className={styles.features}>
          {pro.map((item) => (
            <li key={item.text}>
              <Check size={16} aria-hidden="true" />
              <span>
                {item.text}
                {item.soon && <span className={styles.soon}>SOON</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
