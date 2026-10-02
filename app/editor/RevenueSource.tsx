"use client";

import { useEffect, useId, useState } from "react";
import { AlertTriangle, BadgeCheck, ExternalLink, Loader2, RefreshCw, Unplug } from "lucide-react";
import { useEditor } from "@/app/lib/editor-context";
import {
  connectRevenue,
  disconnectRevenue,
  refreshRevenue,
  useRevenueConnections,
} from "@/app/lib/hooks/useRevenueConnections";
import styles from "./RevenueSource.module.css";

type Source = "stripe" | "lemonsqueezy" | "manual";

const PROVIDER_NAMES = { stripe: "Stripe", lemonsqueezy: "Lemon Squeezy" } as const;

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

function money(value: number | string | null, currency: string | null) {
  const n = Number(value ?? 0);
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${Math.round(n)}`;
  }
}

// Where a SaaS block's numbers come from: a connected provider (verified) or
// typed by hand (self-reported). Manual fields render as `children`.
export function RevenueSource({
  blockId,
  hasManualNumbers,
  children,
}: {
  blockId: string;
  hasManualNumbers: boolean;
  children: React.ReactNode;
}) {
  const connections = useRevenueConnections();
  const connection = connections.find((c) => c.block_id === blockId);
  const { layout, content } = useEditor();
  const keyId = useId();

  const [source, setSource] = useState<Source>(hasManualNumbers ? "manual" : "stripe");
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState<"connect" | "refresh" | "disconnect" | null>(null);
  const [message, setMessage] = useState<{ tone: "error" | "ok"; text: string } | null>(null);

  useEffect(() => {
    setApiKey("");
    setMessage(null);
  }, [blockId, source]);

  // The server only accepts blocks it can see, so save the draft first.
  async function saveDraft(): Promise<boolean> {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout, content, layoutVersion: 2 }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async function handleConnect(provider: "stripe" | "lemonsqueezy") {
    setBusy("connect");
    setMessage(null);
    if (!(await saveDraft())) {
      setBusy(null);
      setMessage({ tone: "error", text: "Couldn't save your draft. Save it from the top bar, then try again." });
      return;
    }
    const result = await connectRevenue(blockId, provider, apiKey);
    setBusy(null);
    if (result.ok) {
      setApiKey("");
      setMessage({ tone: "ok", text: "Connected. Your numbers are verified." });
    } else {
      setMessage({ tone: "error", text: result.message });
    }
  }

  async function handleRefresh() {
    setBusy("refresh");
    setMessage(null);
    const result = await refreshRevenue(blockId);
    setBusy(null);
    setMessage(result.ok ? { tone: "ok", text: "Updated." } : { tone: "error", text: result.message });
  }

  async function handleDisconnect() {
    if (!window.confirm("Disconnect and delete the stored key? The block goes back to typed-in numbers.")) return;
    setBusy("disconnect");
    const result = await disconnectRevenue(blockId);
    setBusy(null);
    if (!result.ok) setMessage({ tone: "error", text: result.message });
    else setSource("manual");
  }

  if (connection) {
    const provider = PROVIDER_NAMES[connection.provider];
    return (
      <section className={styles.panel} aria-label="Revenue source">
        <span className={styles.heading}>Revenue source</span>
        <div className={styles.connected}>
          <div className={styles.connectedTop}>
            <span className={styles.verified}>
              <BadgeCheck size={14} aria-hidden="true" /> Verified · {provider}
            </span>
            <span className={styles.hint}>{connection.key_hint}</span>
          </div>
          <div className={styles.stats}>
            <div>
              <span className={styles.statValue}>{money(connection.mrr, connection.currency)}</span>
              <span className={styles.statLabel}>MRR</span>
            </div>
            <div>
              <span className={styles.statValue}>{connection.customers ?? 0}</span>
              <span className={styles.statLabel}>subscriptions</span>
            </div>
          </div>
          <span className={styles.muted}>Updated {timeAgo(connection.synced_at)} · refreshes daily</span>
          {connection.status === "error" && connection.last_error && (
            <p className={styles.error} role="alert">
              <AlertTriangle size={13} aria-hidden="true" /> Last update failed: {connection.last_error}
            </p>
          )}
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={handleRefresh} disabled={busy !== null}>
              {busy === "refresh" ? <Loader2 size={13} className={styles.spin} /> : <RefreshCw size={13} />}
              Refresh now
            </button>
            <button type="button" className={styles.danger} onClick={handleDisconnect} disabled={busy !== null}>
              {busy === "disconnect" ? <Loader2 size={13} className={styles.spin} /> : <Unplug size={13} />}
              Disconnect
            </button>
          </div>
        </div>
        {message && (
          <p className={message.tone === "error" ? styles.error : styles.ok} role="status">
            {message.text}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-label="Revenue source">
      <span className={styles.heading}>Revenue source</span>
      <div className={styles.segment} role="radiogroup" aria-label="Revenue source">
        {(["stripe", "lemonsqueezy", "manual"] as Source[]).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={source === value}
            className={source === value ? styles.segmentActive : undefined}
            onClick={() => setSource(value)}
          >
            {value === "manual" ? "Type it" : PROVIDER_NAMES[value]}
          </button>
        ))}
      </div>

      {source === "stripe" && (
        <div className={styles.flow}>
          <ol className={styles.steps}>
            <li>
              In Stripe, open{" "}
              <a href="https://dashboard.stripe.com/apikeys/create" target="_blank" rel="noopener noreferrer">
                Create restricted key <ExternalLink size={11} aria-hidden="true" />
              </a>
            </li>
            <li>
              Name it <strong>BentoFolio</strong>. Set <strong>Subscriptions</strong> and <strong>Invoices</strong> to{" "}
              <strong>Read</strong>. Leave everything else as None.
            </li>
            <li>Create the key and paste it here. It starts with rk_live_.</li>
          </ol>
          <label className={styles.field} htmlFor={keyId}>
            <span className={styles.label}>Restricted key</span>
            <input
              id={keyId}
              className={styles.input}
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="rk_live_…"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
          </label>
          <button
            type="button"
            className={styles.primary}
            onClick={() => handleConnect("stripe")}
            disabled={busy !== null || !apiKey.trim()}
          >
            {busy === "connect" && <Loader2 size={13} className={styles.spin} />}
            Connect Stripe
          </button>
          <p className={styles.muted}>
            Read-only: the key can&apos;t charge, refund or change anything. We store it encrypted and only use it to read
            your revenue.
          </p>
        </div>
      )}

      {source === "lemonsqueezy" && (
        <div className={styles.flow}>
          <p className={styles.warning}>
            <AlertTriangle size={13} aria-hidden="true" />
            <span>
              Lemon Squeezy keys can&apos;t be limited to read-only, so this key has full access to your store. We only
              ever read from it and store it encrypted. You can delete it in Lemon Squeezy at any time to cut access.
            </span>
          </p>
          <ol className={styles.steps}>
            <li>
              In Lemon Squeezy, open{" "}
              <a href="https://app.lemonsqueezy.com/settings/api" target="_blank" rel="noopener noreferrer">
                Settings → API <ExternalLink size={11} aria-hidden="true" />
              </a>
            </li>
            <li>
              Create a key named <strong>BentoFolio</strong> and paste it here.
            </li>
          </ol>
          <label className={styles.field} htmlFor={keyId}>
            <span className={styles.label}>API key</span>
            <input
              id={keyId}
              className={styles.input}
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="eyJ0eXAiOiJKV1Qi…"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
          </label>
          <button
            type="button"
            className={styles.primary}
            onClick={() => handleConnect("lemonsqueezy")}
            disabled={busy !== null || !apiKey.trim()}
          >
            {busy === "connect" && <Loader2 size={13} className={styles.spin} />}
            Connect Lemon Squeezy
          </button>
        </div>
      )}

      {source === "manual" && (
        <div className={styles.flow}>
          <p className={styles.muted}>Typed-in numbers show as “Self-reported” on your page.</p>
          {children}
        </div>
      )}

      {message && (
        <p className={message.tone === "error" ? styles.error : styles.ok} role="status">
          {message.text}
        </p>
      )}
    </section>
  );
}
