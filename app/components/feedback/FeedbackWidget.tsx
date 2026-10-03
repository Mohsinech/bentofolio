"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, MessageCircle, X } from "lucide-react";
import styles from "./FeedbackWidget.module.css";

const PRODUCT_ROUTES = new Set([
  "",
  "auth",
  "contact",
  "discover",
  "editor",
  "examples",
  "invite",
  "pricing",
  "v2-preview",
]);

function isPublicPortfolioPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "editor" || segments[0] === "v2-preview") return true;

  if (segments.length !== 1) return false;

  return !PRODUCT_ROUTES.has(segments[0]);
}

export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  // Escape closes; the field is ready to type in when it opens.
  useEffect(() => {
    if (!open) return;
    fieldRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (isPublicPortfolioPath(pathname || "/")) {
    return null;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setStatus(null);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, pageUrl: window.location.href }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Couldn't send this right now. Try again in a moment.");
        return;
      }
      setMessage("");
      setStatus("Sent. Thanks, I read every message.");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.wrap} data-print-hide>
      {open && (
        <section className={styles.panel} aria-label="Send feedback">
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Feedback</span>
              <h2>Something off?</h2>
            </div>
            <button type="button" className={styles.closeButton} onClick={() => setOpen(false)} aria-label="Close feedback">
              <X size={16} />
            </button>
          </div>

          <p className={styles.copy}>A bug, something confusing, an idea. It goes straight to the person who builds bentofolio.</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <textarea
              ref={fieldRef}
              className={styles.textarea}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                if (status) setStatus(null);
              }}
              placeholder="What happened?"
              required
            />
            <div className={styles.formFoot}>
              {status ? (
                <p className={styles.status}>
                  <Check size={14} aria-hidden="true" /> {status}
                </p>
              ) : error ? (
                <p className={styles.error}>{error}</p>
              ) : (
                <span />
              )}
              <button type="submit" className={styles.sendButton} disabled={sending || message.trim().length < 6}>
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close feedback" : "Send feedback"}
        aria-expanded={open}
      >
        {open ? <X size={18} aria-hidden="true" /> : <MessageCircle size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}
