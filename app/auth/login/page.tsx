"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Github, Lock, Mail } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // A name claimed on the landing page rides along, so "Sign up" keeps it.
  const [claimed, setClaimed] = useState("");
  useEffect(() => {
    setClaimed(new URLSearchParams(window.location.search).get("username")?.trim() || "");
  }, []);
  const router = useRouter();
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      // Friendly error messages
      if (error.message.includes("Invalid login credentials")) {
        setError(
          "No account found with these credentials. Please check your email and password or sign up."
        );
      } else if (error.message.includes("Email not confirmed")) {
        setError(
          "Please check your email and click the confirmation link first."
        );
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      router.push("/editor");
      router.refresh();
    }
  };

  const handleGithubLogin = async () => {
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

  return (
    <main className={styles.container}>
      <div className={styles.loginShell}>
        <section className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Welcome <span className={styles.serif}>back.</span>
          </h1>
          <p className={styles.subtitle}>Log in to edit your page.</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleEmailLogin}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrap}>
              <Mail size={16} />
              <input
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>Password</label>
              <Link href="/auth/reset-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>
            <div className={styles.inputWrap}>
              <Lock size={16} />
              <input
                type="password"
                className={styles.input}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Logging in…" : "Log in"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>or</span>
          <span className={styles.dividerLine} />
        </div>

        <div className={styles.socialButtons}>
          <button type="button" className={styles.socialButton} onClick={handleGithubLogin}>
            <Github size={17} aria-hidden="true" />
            Continue with GitHub
          </button>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            New here?{" "}
            <Link href={claimed ? `/auth/signup?username=${encodeURIComponent(claimed)}` : "/auth/signup"} className={styles.footerLink}>
              Create your page
            </Link>
          </p>
        </div>
        </section>
      </div>
    </main>
  );
}
