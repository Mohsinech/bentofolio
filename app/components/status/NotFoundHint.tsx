"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { checkUsernameFormat, normalizeUsername } from "@/app/lib/usernames";
import m from "@/app/components/marketing/marketing.module.css";
import s from "./status.module.css";

// On /<name> with no page behind it, offer the name; anywhere else, a
// plain "this link is old" note.
export function NotFoundHint() {
  const segments = (usePathname() || "/").split("/").filter(Boolean);
  const name = segments.length === 1 ? normalizeUsername(decodeSafe(segments[0])) : "";
  const claimable = Boolean(name) && checkUsernameFormat(name) === "ok";

  if (claimable) {
    return (
      <>
        <p className={s.text}>
          Nobody has a page at <strong>bentofolio.dev/{name}</strong> yet. It could be yours: free to start, live in
          a few minutes.
        </p>
        <div className={s.actions}>
          <Link href={`/auth/signup?username=${encodeURIComponent(name)}`} className={`${m.btn} ${m.btnDark}`}>
            Claim @{name}
          </Link>
          <Link href="/discover" className={`${m.btn} ${m.btnGhost}`}>
            See other pages
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <p className={s.text}>The link may be old, or the page was moved or renamed.</p>
      <div className={s.actions}>
        <Link href="/" className={`${m.btn} ${m.btnDark}`}>
          Go home
        </Link>
        <Link href="/discover" className={`${m.btn} ${m.btnGhost}`}>
          See other pages
        </Link>
      </div>
    </>
  );
}

function decodeSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
