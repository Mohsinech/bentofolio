"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, Gift, Loader2 } from "lucide-react";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import { FooterLinks, MarketingHeader } from "@/app/components/marketing/Chrome";
import m from "@/app/components/marketing/marketing.module.css";
import { useAuth } from "@/app/lib/hooks/useAuth";
import { APP_DOMAIN } from "@/app/lib/config";
import s from "./invite.module.css";
import { SectionsSkeleton } from "@/app/components/skeleton/Skeleton";

type ReferralInvite = { id: string; email: string; referral_code: string; created_at: string };
type ReferralSignup = { id: string; referred_email: string | null; created_at: string };
type ReferralReward = { code: string; sent_at: string | null; used_at: string | null; created_at: string } | null;
type ReferralData = { invites: ReferralInvite[]; signups: ReferralSignup[]; reward: ReferralReward; threshold: number };

function inviteLink(referralCode: string) {
  const configured = APP_DOMAIN.replace(/\/$/, "");
  const base = configured.includes("localhost") ? "https://bentofolio.dev" : configured;
  return `${base}/auth/signup?ref=${referralCode}`;
}

function when(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(iso));
  } catch {
    return "";
  }
}

export default function InvitePage() {
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const joined = data?.signups.length || 0;
  const threshold = data?.threshold || 5;
  const left = Math.max(0, threshold - joined);
  const signedUpEmails = useMemo(
    () => new Set((data?.signups || []).map((signup) => (signup.referred_email || "").toLowerCase()).filter(Boolean)),
    [data]
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/referrals");
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok) setError(payload.error || "Couldn't load your invites.");
        else setData(payload);
      } catch {
        if (!cancelled) setError("Couldn't load your invites.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1600);
    } catch {
      window.prompt("Copy this:", value);
    }
  }

  async function createInvite(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || "Couldn't create that invite.");
        return;
      }
      setEmail("");
      setData((current) => ({
        invites: [payload.invite, ...(current?.invites || [])],
        signups: current?.signups || [],
        reward: current?.reward || null,
        threshold: current?.threshold || 5,
      }));
      // The new link is what they want next: copy it right away.
      await copy(inviteLink(payload.invite.referral_code), payload.invite.id);
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${bentoFontClasses} ${m.page} ${s.page}`}>
      <MarketingHeader active="invite" />

      <main className={`${m.sec} ${s.main}`}>
        <section className={s.hero}>
          <p className={m.lbl}>Invite friends</p>
          <h1 className={s.title}>
            Bring {threshold} builders. <span className={m.ser}>Get Pro free.</span>
          </h1>
          <p className={s.lead}>
            Send a friend their own invite link. When {threshold} people you invited create an account, we email you a
            code for Pro at no cost.
          </p>
        </section>

        {authLoading || loading ? (
          <SectionsSkeleton sections={2} label="Loading your invites" />
        ) : !user ? (
          <section className={s.card}>
            <h2>Sign in to get your invite links.</h2>
            <p className={s.muted}>Invites are tied to your account, so the reward reaches you.</p>
            <div className={s.row}>
              <Link href="/auth/signup" className={`${m.btn} ${m.btnDark}`}>
                Create an account
              </Link>
              <Link href="/auth/login" className={`${m.btn} ${m.btnGhost}`}>
                Log in
              </Link>
            </div>
          </section>
        ) : (
          <>
            <div className={s.grid}>
              <section className={s.card} aria-labelledby="progress-title">
                <p className={m.lbl}>Progress</p>
                <h2 id="progress-title">
                  {joined} of {threshold} joined
                </h2>
                <div className={s.slots} role="img" aria-label={`${joined} of ${threshold} friends joined`}>
                  {Array.from({ length: threshold }, (_, i) => (
                    <span key={i} className={i < joined ? s.slotOn : s.slot}>
                      {i < joined && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                    </span>
                  ))}
                </div>
                {data?.reward ? (
                  <div className={s.reward}>
                    <span className={s.rewardLabel}>
                      <Gift size={14} aria-hidden="true" /> Your Pro code
                    </span>
                    <strong className={s.code}>{data.reward.code}</strong>
                    <div className={s.row}>
                      {!data.reward.used_at && (
                        <Link href={`/pricing?coupon=${encodeURIComponent(data.reward.code)}`} className={`${m.btn} ${m.btnAccent}`}>
                          Use it now
                        </Link>
                      )}
                      <button type="button" className={`${m.btn} ${m.btnGhost}`} onClick={() => copy(data.reward?.code || "", "reward")}>
                        {copied === "reward" ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                        {copied === "reward" ? "Copied" : "Copy code"}
                      </button>
                    </div>
                    {data.reward.used_at && <p className={s.muted}>Used on {when(data.reward.used_at)}. Enjoy Pro.</p>}
                  </div>
                ) : (
                  <p className={s.muted}>
                    {left === 1 ? "One more friend" : `${left} more friends`} and your Pro code arrives by email. Only
                    accounts created from your links count.
                  </p>
                )}
              </section>

              <section className={s.card} aria-labelledby="new-title">
                <p className={m.lbl}>New invite</p>
                <h2 id="new-title">Who should join?</h2>
                <form className={s.form} onSubmit={createInvite}>
                  <label className={s.srOnly} htmlFor="invite-email">
                    Friend&apos;s email
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="friend@example.com"
                    autoComplete="off"
                    required
                  />
                  <button type="submit" className={`${m.btn} ${m.btnDark}`} disabled={submitting || !email.trim()}>
                    {submitting ? <Loader2 size={15} className={s.spin} aria-hidden="true" /> : null}
                    Create and copy link
                  </button>
                </form>
                <p className={s.muted}>We don&apos;t email your friend. You send the link however you like.</p>
                {error && (
                  <p className={s.error} role="alert">
                    {error}
                  </p>
                )}
              </section>
            </div>

            <section className={s.list} aria-labelledby="links-title">
              <div className={s.listHead}>
                <h2 id="links-title">Your links</h2>
                <span className={m.lbl}>{data?.invites.length || 0}</span>
              </div>
              {data?.invites.length ? (
                <ul>
                  {data.invites.map((invite) => {
                    const joinedAlready = signedUpEmails.has(invite.email.toLowerCase());
                    return (
                      <li key={invite.id}>
                        <div className={s.inviteText}>
                          <strong>{invite.email}</strong>
                          <span>
                            {joinedAlready ? "Joined" : "Not joined yet"} · {when(invite.created_at)}
                          </span>
                        </div>
                        {joinedAlready ? (
                          <span className={s.joined}>
                            <Check size={13} strokeWidth={3} aria-hidden="true" /> Joined
                          </span>
                        ) : (
                          <button type="button" className={s.copy} onClick={() => copy(inviteLink(invite.referral_code), invite.id)}>
                            {copied === invite.id ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                            {copied === invite.id ? "Copied" : "Copy link"}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className={s.muted}>No links yet. Add a friend&apos;s email above to make your first one.</p>
              )}
            </section>
          </>
        )}
      </main>

      <FooterLinks light />
    </div>
  );
}
