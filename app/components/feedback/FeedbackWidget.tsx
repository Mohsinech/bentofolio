"use client";

import { FormEvent, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, Loader2, Send, X } from "lucide-react";
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

  if (isPublicPortfolioPath(pathname || "/")) {
    return null;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setStatus(null);
    setError(null);

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        pageUrl: window.location.href,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "Could not send this right now.");
      setSending(false);
      return;
    }

    setMessage("");
    setStatus("Sent. I’ll take a look and fix it.");
    setSending(false);
  };

  return (
    <div className={styles.wrap} data-print-hide>
      {open && (
        <section className={styles.panel} aria-label="Send feedback">
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Tiny support corner</span>
              <h2>I just built this app.</h2>
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setOpen(false)}
              aria-label="Close feedback"
            >
              <X size={16} />
            </button>
          </div>

          <p className={styles.copy}>
            If you face any problem, please feel free to let me know and I’ll
            fix it.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <textarea
              className={styles.textarea}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="What broke, felt confusing, or made you side-eye the app?"
              required
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={sending || message.trim().length < 6}
            >
              {sending ? <Loader2 size={16} /> : status ? <Check size={16} /> : <Send size={16} />}
              {sending ? "Sending" : status ? "Sent" : "Send"}
            </button>
            {status && <p className={styles.status}>{status}</p>}
            {error && <p className={styles.error}>{error}</p>}
          </form>
        </section>
      )}

      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close feedback" : "Open feedback"}
      >
        ?
      </button>
    </div>
  );
}
