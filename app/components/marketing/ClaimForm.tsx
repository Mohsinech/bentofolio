"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkUsernameFormat, normalizeUsername, usernameMessage } from "@/app/lib/usernames";
import { useSignedIn } from "./AccountLinks";
import styles from "./marketing.module.css";

// bentofolio.dev/[yourname] [Claim] — checks the name as you type, then sends
// you to sign up with it filled in. Signed-in people go to the editor.
export function ClaimForm({ dark = false, id }: { dark?: boolean; id: string }) {
  const router = useRouter();
  const signedIn = useSignedIn();
  const [value, setValue] = useState("");
  const [check, setCheck] = useState<{ name: string; ok: boolean; text: string } | null>(null);
  const name = normalizeUsername(value);
  const format = name ? checkUsernameFormat(name) : null;

  useEffect(() => {
    if (!name || format !== "ok") return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/username/check?u=${encodeURIComponent(name)}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = await response.json();
        setCheck({ name, ok: Boolean(data.available), text: data.available ? `${name} is free` : data.message });
      } catch {
        // Offline or aborted: the signup page checks again.
      }
    }, 350);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [name, format]);

  const hint = !name
    ? null
    : format !== "ok"
      ? { ok: false, text: usernameMessage(format!) }
      : check && check.name === name
        ? check
        : null;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (signedIn) {
      router.push("/editor");
      return;
    }
    if (name && format !== "ok") return;
    router.push(name ? `/auth/signup?username=${encodeURIComponent(name)}` : "/auth/signup");
  }

  return (
    <div className={`${styles.claimWrap} ${dark ? styles.claimDark : ""}`}>
      <form className={styles.claim} onSubmit={submit} aria-label="Claim your page">
        <label className={styles.claimPrefix} htmlFor={id}>
          bentofolio.dev/
        </label>
        <input
          id={id}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="yourname"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={30}
          aria-describedby={`${id}-hint`}
        />
        <button type="submit" className={`${styles.btn} ${styles.btnAccent}`}>
          Claim
        </button>
      </form>
      <p
        id={`${id}-hint`}
        className={`${styles.claimHint} ${hint ? (hint.ok ? styles.hintOk : styles.hintBad) : ""}`}
        aria-live="polite"
      >
        {hint?.text ?? ""}
      </p>
    </div>
  );
}
