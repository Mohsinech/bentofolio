"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Check, FileDown, Globe, Loader2 } from "lucide-react";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import { BrandLink } from "@/app/components/marketing/Chrome";
import m from "@/app/components/marketing/marketing.module.css";
import s from "./success.module.css";

type State = { kind: "checking" } | { kind: "pro"; username: string | null } | { kind: "slow" } | { kind: "signedOut" };

const POLL_MS = 2500;
const POLL_TRIES = 24; // about a minute

// After checkout: confirms the payment (straight from Lemon Squeezy when the
// order id is known, otherwise by waiting for the webhook), then shows what
// to do first.
export default function UpgradeSuccessPage() {
  const [state, setState] = useState<State>({ kind: "checking" });

  useEffect(() => {
    const order = new URLSearchParams(window.location.search).get("order") || "";
    let tries = 0;
    let timer: number | undefined;
    let stopped = false;

    async function check() {
      tries++;
      try {
        const response = await fetch(`/api/checkout/status${order ? `?order=${encodeURIComponent(order)}` : ""}`, {
          cache: "no-store",
        });
        if (stopped) return;
        if (response.status === 401) return setState({ kind: "signedOut" });
        const data = await response.json().catch(() => ({}));
        if (data.pro) return setState({ kind: "pro", username: data.username ?? null });
      } catch {
        // Keep trying.
      }
      if (stopped) return;
      if (tries >= POLL_TRIES) return setState({ kind: "slow" });
      timer = window.setTimeout(check, POLL_MS);
    }

    check();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`${bentoFontClasses} ${m.page} ${s.page}`}>
      <header className={`${m.sec} ${m.header}`}>
        <BrandLink />
      </header>

      <main className={`${m.sec} ${s.main}`} aria-live="polite">
        {state.kind === "checking" && (
          <div className={s.center}>
            <Loader2 size={22} className={s.spin} aria-hidden="true" />
            <p className={s.eyebrow}>Checkout</p>
            <h1 className={s.title}>Confirming your payment…</h1>
            <p className={s.text}>This takes a few seconds. You can keep this tab open.</p>
          </div>
        )}

        {state.kind === "pro" && (
          <>
            <div className={s.hero}>
              <span className={s.badge} aria-hidden="true">
                <Check size={22} strokeWidth={3} />
              </span>
              <p className={s.eyebrow}>Pro · lifetime</p>
              <h1 className={s.title}>
                You&apos;re <span className={m.ser}>Pro.</span>
              </h1>
              <p className={s.text}>
                Everything is unlocked{state.username ? (
                  <>
                    {" "}on <strong>bentofolio.dev/{state.username}</strong>
                  </>
                ) : null}
                . Your receipt is on its way to your inbox.
              </p>
            </div>

            <div className={s.next}>
              <Link href="/settings#domain" className={s.step}>
                <Globe size={18} aria-hidden="true" />
                <b>Connect your domain</b>
                <span>Put your page on a domain you own.</span>
              </Link>
              <Link href="/editor/analytics" className={s.step}>
                <BarChart3 size={18} aria-hidden="true" />
                <b>See your visitors</b>
                <span>Views, sources, countries and clicks.</span>
              </Link>
              <Link href={state.username ? `/${state.username}?view=cv` : "/editor"} className={s.step}>
                <FileDown size={18} aria-hidden="true" />
                <b>Download your CV</b>
                <span>Open the CV view and press PDF.</span>
              </Link>
            </div>

            <div className={s.actions}>
              <Link href="/editor" className={`${m.btn} ${m.btnDark}`}>
                Back to the editor
              </Link>
            </div>
          </>
        )}

        {state.kind === "slow" && (
          <div className={s.center}>
            <p className={s.eyebrow}>Checkout</p>
            <h1 className={s.title}>Payment received, still confirming.</h1>
            <p className={s.text}>
              It usually takes under a minute. Refresh in a moment, or watch your inbox for the receipt. If Pro
              isn&apos;t on within 10 minutes, write to <a href="mailto:hello@bentofolio.dev">hello@bentofolio.dev</a>{" "}
              and we&apos;ll sort it out.
            </p>
            <div className={s.actions}>
              <button type="button" className={`${m.btn} ${m.btnDark}`} onClick={() => window.location.reload()}>
                Refresh
              </button>
              <Link href="/editor" className={`${m.btn} ${m.btnGhost}`}>
                Back to the editor
              </Link>
            </div>
          </div>
        )}

        {state.kind === "signedOut" && (
          <div className={s.center}>
            <p className={s.eyebrow}>Checkout</p>
            <h1 className={s.title}>Sign in to finish.</h1>
            <p className={s.text}>Your payment is safe. Sign in with the account you upgraded and Pro will be there.</p>
            <div className={s.actions}>
              <Link href="/auth/login" className={`${m.btn} ${m.btnDark}`}>
                Sign in
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
