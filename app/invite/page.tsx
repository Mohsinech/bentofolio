"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Gift,
  Loader2,
  Mail,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "@/app/lib/hooks/useAuth";
import { APP_DOMAIN } from "@/app/lib/config";
import styles from "./invite.module.css";

type ReferralInvite = {
  id: string;
  email: string;
  referral_code: string;
  created_at: string;
};

type ReferralSignup = {
  id: string;
  referred_email: string | null;
  created_at: string;
};

type ReferralReward = {
  code: string;
  sent_at: string | null;
  used_at: string | null;
  created_at: string;
} | null;

type ReferralData = {
  invites: ReferralInvite[];
  signups: ReferralSignup[];
  reward: ReferralReward;
  threshold: number;
};

function getInviteLink(referralCode: string) {
  const configuredUrl = APP_DOMAIN.replace(/\/$/, "");
  const baseUrl = configuredUrl.includes("localhost")
    ? "https://bentofolio.dev"
    : configuredUrl;
  return `${baseUrl}/auth/signup?ref=${referralCode}`;
}

export default function InvitePage() {
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const completedCount = data?.signups.length || 0;
  const threshold = data?.threshold || 5;
  const progress = Math.min(100, Math.round((completedCount / threshold) * 100));
  const latestInvite = data?.invites[0];
  const latestInviteLink = useMemo(
    () => (latestInvite ? getInviteLink(latestInvite.referral_code) : ""),
    [latestInvite]
  );

  const loadReferrals = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch("/api/referrals");
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Failed to load invites");
    } else {
      setData(payload);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      loadReferrals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  const createInvite = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/referrals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Failed to create invite");
    } else {
      setEmail("");
      setData((current) => ({
        invites: [payload.invite, ...(current?.invites || [])],
        signups: current?.signups || [],
        reward: current?.reward || null,
        threshold: current?.threshold || 5,
      }));
    }

    setSubmitting(false);
  };

  const copyText = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1400);
  };

  if (authLoading || loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loading}>
          <Loader2 className={styles.spinner} size={22} />
          Loading invites
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.container}>
        <section className={styles.authCard}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={17} />
            BentoFolio
          </Link>
          <div className={styles.iconBubble}>
            <Gift size={24} />
          </div>
          <h1>Invite friends. Earn Pro.</h1>
          <p>
            Sign in first, then share your referral link. When 5 friends create
            accounts, you get a 100% Pro coupon by email.
          </p>
          <Link href="/auth/signup" className={styles.primaryLink}>
            Create account
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={17} />
          BentoFolio
        </Link>
        <Link href="/pricing" className={styles.pricingLink}>
          Pricing
        </Link>
      </header>

      <section className={styles.hero}>
        <span className={styles.eyebrow}>
          <Sparkles size={14} />
          Invite & Earn
        </span>
        <h1>Bring 5 builders. Get Pro for free.</h1>
        <p>
          Add a friend&apos;s email, copy the referral link, and share it. When
          5 invited people create BentoFolio accounts, your 100% Pro coupon is
          sent to your email.
        </p>
      </section>

      <section className={styles.grid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.kicker}>New invite</span>
              <h2>Add an email</h2>
            </div>
            <Mail size={20} />
          </div>

          <form className={styles.form} onSubmit={createInvite}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="friend@example.com"
              required
            />
            <button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className={styles.spinner} size={16} />
              ) : (
                <Gift size={16} />
              )}
              Create link
            </button>
          </form>

          {error && <p className={styles.error}>{error}</p>}

          {latestInvite && (
            <div className={styles.linkBox}>
              <span>Latest referral link</span>
              <button
                type="button"
                onClick={() => copyText(latestInviteLink, latestInvite.id)}
              >
                {copied === latestInvite.id ? (
                  <Check size={15} />
                ) : (
                  <Copy size={15} />
                )}
                {copied === latestInvite.id ? "Copied" : "Copy link"}
              </button>
            </div>
          )}
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.kicker}>Progress</span>
              <h2>
                {completedCount}/{threshold} friends
              </h2>
            </div>
            <Users size={20} />
          </div>

          <div className={styles.progressTrack}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <p className={styles.progressCopy}>
            Only confirmed account creations count. Random clicks and “I swear
            I signed up bro” energy do not.
          </p>

          {data?.reward ? (
            <div className={styles.rewardBox}>
              <span>Your earned coupon</span>
              <strong>{data.reward.code}</strong>
              <button
                type="button"
                onClick={() => copyText(data.reward?.code || "", "reward")}
              >
                {copied === "reward" ? <Check size={15} /> : <Copy size={15} />}
                {copied === "reward" ? "Copied" : "Copy coupon"}
              </button>
            </div>
          ) : (
            <div className={styles.emptyReward}>
              <Gift size={18} />
              Your 100% coupon appears here after 5 confirmed signups.
            </div>
          )}
        </article>
      </section>

      <section className={styles.inviteList}>
        <div className={styles.listHeader}>
          <h2>Invite links</h2>
          <span>{data?.invites.length || 0} created</span>
        </div>

        {data?.invites.length ? (
          data.invites.map((invite) => {
            const link = getInviteLink(invite.referral_code);
            return (
              <div className={styles.inviteItem} key={invite.id}>
                <div>
                  <strong>{invite.email}</strong>
                  <span>{invite.referral_code}</span>
                </div>
                <button type="button" onClick={() => copyText(link, invite.id)}>
                  {copied === invite.id ? <Check size={15} /> : <Copy size={15} />}
                  {copied === invite.id ? "Copied" : "Copy"}
                </button>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyList}>No invites yet.</div>
        )}
      </section>
    </main>
  );
}
