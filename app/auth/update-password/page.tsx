"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/client";
import styles from "../auth.module.css";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);

      // Send password change notification
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        try {
          await fetch("/api/auth/password-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
          });
        } catch (error) {
          console.error("Failed to send password notification:", error);
          // Don't block the user, just log the error
        }
      }

      setTimeout(() => {
        router.push("/editor");
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Password <span className={styles.serif}>updated.</span></h1>
            <p className={styles.subtitle}>
              Your password has been successfully changed
            </p>
          </div>
          <div className={styles.success}>Redirecting you to the editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Set a new <span className={styles.serif}>password.</span></h1>
          <p className={styles.subtitle}>
            Choose a strong password for your account
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleUpdatePassword}>
          <div className={styles.field}>
            <label className={styles.label}>New Password</label>
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

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            <Link href="/auth/login" className={styles.footerLink}>
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
