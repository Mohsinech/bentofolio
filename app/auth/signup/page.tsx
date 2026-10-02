"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github, Loader2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { checkUsernameFormat, normalizeUsername } from "@/app/lib/usernames";
import styles from "../auth.module.css";

function param(name: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(name)?.trim() ?? "";
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [github, setGithub] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  // The name claimed on the landing page (?username=mira). It's checked
  // again when the account is created; if it was taken meanwhile, onboarding
  // asks for another.
  const [claimed, setClaimed] = useState(() => {
    const name = normalizeUsername(param("username"));
    return name && checkUsernameFormat(name) === "ok" ? name : "";
  });
  const [referralCode] = useState(() => param("ref").toUpperCase());
  const [couponCode] = useState(() => param("coupon").toUpperCase());
  const router = useRouter();
  const supabase = createClient();

  const getAuthCallbackUrl = () => {
    const url = new URL("/auth/callback", window.location.origin);
    if (referralCode) url.searchParams.set("ref", referralCode);
    if (couponCode) url.searchParams.set("coupon", couponCode);
    // New accounts continue in onboarding, with the claimed name filled in.
    url.searchParams.set("next", claimed ? `/onboarding?username=${encodeURIComponent(claimed)}` : "/onboarding");
    return url.toString();
  };

  const handleEmailSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const normalizedEmail = email.trim();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          username: claimed || undefined,
          referral_code: referralCode || undefined,
          beta_coupon_code: couponCode || undefined,
        },
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setEmail(normalizedEmail);
    if (data.session) {
      if (couponCode) {
        await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discountCode: couponCode }),
        }).catch(() => null);
      }
      router.push("/onboarding");
      router.refresh();
      return;
    }
    setLoading(false);
    setSuccess(true);
  };

  const handleResendConfirmation = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;
    setResending(true);
    setError(null);
    setResendMessage(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: { emailRedirectTo: getAuthCallbackUrl() },
    });
    if (error) setError(error.message);
    else setResendMessage("Sent again. Check your spam folder too.");
    setResending(false);
  };

  const handleGithubSignup = async () => {
    setGithub(true);
    setError(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) await supabase.auth.signOut();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: getAuthCallbackUrl() },
    });
    if (error) {
      setError(error.message);
      setGithub(false);
    }
  };

  if (success) {
    return (
      <main className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              Check your <span className={styles.serif}>email.</span>
            </h1>
            <p className={styles.subtitle}>
              We sent a confirmation link to <b>{email}</b>. Open it to finish setting up your page.
            </p>
          </div>
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}
          {resendMessage && (
            <div className={styles.success} role="status">
              {resendMessage}
            </div>
          )}
          <button type="button" className={styles.socialButton} onClick={handleResendConfirmation} disabled={resending}>
            {resending ? "Sending…" : "Send the link again"}
          </button>
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already confirmed?{" "}
              <Link href="/auth/login" className={styles.footerLink}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Create your <span className={styles.serif}>page.</span>
          </h1>
          <p className={styles.subtitle}>Free forever. You&apos;ll pick a layout next.</p>
        </div>

        {claimed && (
          <div className={styles.claiming}>
            <span>
              Claiming <b>bentofolio.dev/{claimed}</b>
            </span>
            <button type="button" onClick={() => setClaimed("")}>
              Pick another
            </button>
          </div>
        )}

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <div className={styles.socialButtons}>
          <button type="button" className={styles.socialButton} onClick={handleGithubSignup} disabled={github}>
            {github ? <Loader2 size={17} className={styles.spinner} aria-hidden="true" /> : <Github size={17} aria-hidden="true" />}
            Continue with GitHub
          </button>
        </div>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>or with email</span>
          <span className={styles.dividerLine} />
        </div>

        <form className={styles.form} onSubmit={handleEmailSignup}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              className={styles.input}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading && <Loader2 size={16} className={styles.spinner} aria-hidden="true" />}
            {loading ? "Creating your account…" : "Create account"}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?{" "}
            <Link href="/auth/login" className={styles.footerLink}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
