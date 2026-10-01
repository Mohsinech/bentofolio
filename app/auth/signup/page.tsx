"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import {
  checkUsernameFormat,
  normalizeUsername,
  usernameMessage,
} from "@/app/lib/usernames";
import styles from "../auth.module.css";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  // Live availability for the username field.
  const [usernameCheck, setUsernameCheck] = useState<{
    username: string;
    available: boolean;
    message: string;
  } | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [referralCode] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("ref")?.trim().toUpperCase() || "";
  });
  const [couponCode] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("coupon")?.trim().toUpperCase() || "";
  });
  const router = useRouter();
  const supabase = createClient();

  const getAuthCallbackUrl = () => {
    const url = new URL("/auth/callback", window.location.origin);
    if (referralCode) {
      url.searchParams.set("ref", referralCode);
    }
    if (couponCode) {
      url.searchParams.set("coupon", couponCode);
    }
    return url.toString();
  };

  const typedUsername = normalizeUsername(username);
  const typedFormat = typedUsername ? checkUsernameFormat(typedUsername) : null;

  useEffect(() => {
    if (!typedUsername || typedFormat !== "ok") {
      setUsernameCheck(null);
      setCheckingUsername(false);
      return;
    }
    setCheckingUsername(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/username/check?u=${encodeURIComponent(typedUsername)}`,
          { signal: controller.signal }
        );
        if (response.ok && !controller.signal.aborted) {
          const data = await response.json();
          setUsernameCheck({
            username: data.username,
            available: data.available,
            message: data.message,
          });
        }
      } catch {
        // Aborted or offline: signup still works; a taken name falls back
        // to a placeholder the editor asks to replace.
      } finally {
        if (!controller.signal.aborted) setCheckingUsername(false);
      }
    }, 350);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [typedUsername, typedFormat]);

  const usernameHint = !typedUsername
    ? null
    : typedFormat !== "ok"
      ? { ok: false, text: usernameMessage(typedFormat!) }
      : checkingUsername
        ? { ok: null, text: "Checking…" }
        : usernameCheck && usernameCheck.username === typedUsername
          ? { ok: usernameCheck.available, text: usernameCheck.message }
          : null;

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim();

    const formatStatus = checkUsernameFormat(normalizedUsername);
    if (formatStatus !== "ok") {
      setError(usernameMessage(formatStatus));
      setLoading(false);
      return;
    }

    if (
      usernameCheck &&
      usernameCheck.username === normalizedUsername &&
      !usernameCheck.available
    ) {
      setError(`bentofolio.dev/${normalizedUsername}: ${usernameCheck.message}`);
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      await supabase.auth.signOut();
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          username: normalizedUsername,
          referral_code: referralCode || undefined,
          beta_coupon_code: couponCode || undefined,
        },
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setEmail(normalizedEmail);
      if (data.session) {
        if (couponCode) {
          await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ discountCode: couponCode }),
          }).catch(() => null);
        }
        router.push("/editor");
        router.refresh();
        return;
      }
      setLoading(false);
      setSuccess(true);
    }
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
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setResendMessage("Confirmation email sent again. Check spam too.");
    }
    setResending(false);
  };

  const handleGithubSignup = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      await supabase.auth.signOut();
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: getAuthCallbackUrl(),
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={`glass ${styles.card}`}>
          <div className={styles.header}>
            <h1 className={styles.logo}>
              Bento<span className={styles.logoAccent}>Folio</span>
            </h1>
            <h2 className={styles.title}>Check your email!</h2>
            <p className={styles.subtitle}>
              We&apos;ve sent you a confirmation link to {email}
            </p>
          </div>
          <div className={styles.success}>
            Click the link in your email to activate your account.
          </div>
          {error && <div className={styles.error}>{error}</div>}
          {resendMessage && <div className={styles.success}>{resendMessage}</div>}
          <button
            type="button"
            className={styles.submitButton}
            onClick={handleResendConfirmation}
            disabled={resending}
          >
            {resending ? "Sending..." : "Resend confirmation email"}
          </button>
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already confirmed?{" "}
              <Link href="/auth/login" className={styles.footerLink}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`glass ${styles.card}`}>
        <div className={styles.header}>
          <h1 className={styles.logo}>
            Bento<span className={styles.logoAccent}>Folio</span>
          </h1>
          <h2 className={styles.title}>Create your portfolio</h2>
          <p className={styles.subtitle}>
            Start building your beautiful bento resume
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleEmailSignup}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-username">Username</label>
            <input
              id="signup-username"
              type="text"
              className={styles.input}
              placeholder="yourname"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={30}
              aria-describedby="signup-username-hint"
              required
            />
            <span
              id="signup-username-hint"
              aria-live="polite"
              style={{
                minHeight: 18,
                fontSize: 13,
                color:
                  usernameHint?.ok === true
                    ? "#1f7a45"
                    : usernameHint?.ok === false
                      ? "#b42318"
                      : "inherit",
                opacity: usernameHint?.ok === null ? 0.7 : 1,
              }}
            >
              {usernameHint
                ? `bentofolio.dev/${typedUsername} · ${usernameHint.text}`
                : " "}
            </span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>or</span>
          <span className={styles.dividerLine} />
        </div>

        <div className={styles.socialButtons}>
          <button className={styles.socialButton} onClick={handleGithubSignup}>
            <Github size={18} />
            GitHub
          </button>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?{" "}
            <Link href="/auth/login" className={styles.footerLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
