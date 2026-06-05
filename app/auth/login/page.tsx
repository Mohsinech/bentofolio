"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Github, LayoutGrid, Lock, Mail, Sparkles } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import styles from "../auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
      <Link href="/" className={styles.backHome}>
        Bento<span>Folio</span>
      </Link>

      <div className={styles.loginShell}>
        <section className={styles.visualPanel} aria-label="BentoFolio preview">
          <div className={styles.visualHeader}>
            <span>
              <LayoutGrid size={15} />
              Studio preview
            </span>
            <em>Pro-ready</em>
          </div>
          <div className={styles.previewGrid}>
            <div className={styles.previewHero}>
              <strong>Hey, I&apos;m Mira</strong>
              <span>Designer / creative dev</span>
            </div>
            <div className={styles.previewAvatar}>M</div>
            <div className={styles.previewTile}>
              <Sparkles size={18} />
              <span>Recent work</span>
            </div>
            <div className={styles.previewTile}>
              <Mail size={18} />
              <span>Let&apos;s collab</span>
            </div>
          </div>
          <p>
            Come back to your canvas, update cards, publish changes, and keep
            the public portfolio feeling sharp.
          </p>
        </section>

        <section className={`glass ${styles.card} ${styles.authPanel}`}>
        <div className={styles.header}>
          <h1
            className={styles.logo}
            style={{ fontFamily: "var(--font-achiko), sans-serif" }}
          >
            Bento<span className={styles.logoAccent}>Folio</span>
          </h1>
          <h2
            className={styles.title}
            style={{ fontFamily: "var(--font-montreal), sans-serif" }}
          >
            Welcome back
          </h2>
          <p
            className={styles.subtitle}
            style={{ fontFamily: "var(--font-mori), sans-serif" }}
          >
            Sign in to continue building your BentoFolio.
          </p>
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
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>or</span>
          <span className={styles.dividerLine} />
        </div>

        <div className={styles.socialButtons}>
          <button className={styles.socialButton} onClick={handleGithubLogin}>
            <Github size={18} />
            GitHub
          </button>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className={styles.footerLink}>
              Sign up
            </Link>
          </p>
        </div>
        </section>
      </div>
    </main>
  );
}
