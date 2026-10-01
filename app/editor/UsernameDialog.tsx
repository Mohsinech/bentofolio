"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import {
  checkUsernameFormat,
  normalizeUsername,
  usernameMessage,
  type UsernameStatus,
} from "@/app/lib/usernames";
import styles from "./UsernameDialog.module.css";

interface CheckResult {
  username: string;
  status: UsernameStatus;
  available: boolean;
  message: string;
  suggestions: string[];
}

interface UsernameDialogProps {
  // "claim": the account still has a user_xxxxxxxx placeholder.
  // "change": picking a new name for an existing page.
  mode: "claim" | "change";
  currentUsername: string;
  initialValue?: string;
  onSave: (username: string) => Promise<{ ok: boolean; message?: string }>;
  onClose: () => void;
}

export function UsernameDialog({
  mode,
  currentUsername,
  initialValue = "",
  onSave,
  onClose,
}: UsernameDialogProps) {
  const titleId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialValue);
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const name = normalizeUsername(value);
  const isCurrent = name === normalizeUsername(currentUsername);
  const formatStatus = name ? checkUsernameFormat(name) : null;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  // Ask the server once typing pauses and the format is valid.
  useEffect(() => {
    setSaveMessage(null);
    if (!name || formatStatus !== "ok" || isCurrent) {
      setCheck(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/username/check?u=${encodeURIComponent(name)}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (!controller.signal.aborted && response.ok) setCheck(data);
      } catch {
        // Aborted or offline: the save itself still checks.
      } finally {
        if (!controller.signal.aborted) setChecking(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [name, formatStatus, isCurrent]);

  const available = Boolean(check?.available && check.username === name);
  const canSave = available && !saving && !checking;

  let hint: { tone: "ok" | "bad" | "muted"; text: string } | null = null;
  if (saveMessage) hint = { tone: "bad", text: saveMessage };
  else if (!name) hint = null;
  else if (isCurrent) hint = { tone: "muted", text: "That's your current name" };
  else if (formatStatus && formatStatus !== "ok") hint = { tone: "bad", text: usernameMessage(formatStatus) };
  else if (checking) hint = { tone: "muted", text: "Checking…" };
  else if (check && check.username === name)
    hint = { tone: check.available ? "ok" : "bad", text: check.message };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    const result = await onSave(name);
    setSaving(false);
    if (!result.ok) setSaveMessage(result.message || "Couldn't save that name. Try another.");
  }

  return (
    <div className={styles.backdrop} onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <form
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={handleSubmit}
      >
        <div className={styles.head}>
          <h2 id={titleId}>{mode === "claim" ? "Claim your name" : "Change your page address"}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close" disabled={saving}>
            <X size={16} />
          </button>
        </div>

        <p className={styles.lead}>
          {mode === "claim"
            ? "Pick the address people will use to find your page. You can change it later."
            : "Your current link keeps working for 30 days and sends visitors to the new one."}
        </p>

        <label className={styles.field}>
          <span className={styles.label}>Username</span>
          <span
            className={`${styles.inputWrap} ${
              hint?.tone === "ok" ? styles.inputOk : hint?.tone === "bad" ? styles.inputBad : ""
            }`}
          >
            <span className={styles.prefix}>bentofolio.dev/</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(event) => setValue(event.target.value.toLowerCase())}
              placeholder="yourname"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={30}
              aria-describedby={statusId}
              aria-invalid={hint?.tone === "bad"}
            />
            {checking ? (
              <Loader2 size={15} className={styles.spin} aria-hidden="true" />
            ) : available ? (
              <Check size={15} className={styles.okIcon} aria-hidden="true" />
            ) : null}
          </span>
        </label>

        <p id={statusId} className={`${styles.hint} ${hint ? styles[hint.tone] : ""}`} aria-live="polite">
          {hint?.text ?? " "}
        </p>

        {check && !check.available && check.suggestions.length > 0 && check.username === name && (
          <div className={styles.suggestions}>
            <span className={styles.label}>Try</span>
            <div>
              {check.suggestions.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => setValue(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={onClose} disabled={saving}>
            {mode === "claim" ? "Later" : "Cancel"}
          </button>
          <button type="submit" className={styles.primary} disabled={!canSave}>
            {saving && <Loader2 size={14} className={styles.spin} aria-hidden="true" />}
            {mode === "claim" ? "Claim name" : "Change username"}
          </button>
        </div>
      </form>
    </div>
  );
}
