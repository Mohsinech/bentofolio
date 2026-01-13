"use client";

import { useState } from "react";

import Link from "next/link";
import { Github } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import styles from "../auth.module.css";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate username (alphanumeric, underscores, hyphens only)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError(
        "Username can only contain letters, numbers, underscores, and hyphens"
      );
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  const handleGithubSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
            <label className={styles.label}>Username</label>
            <input
              type="text"
              className={styles.input}
              placeholder="yourname"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              required
            />
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
