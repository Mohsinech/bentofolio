"use client";

import { useEffect } from "react";
import Link from "next/link";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import { BrandLink } from "@/app/components/marketing/Chrome";
import m from "@/app/components/marketing/marketing.module.css";
import s from "@/app/components/status/status.module.css";

// Shown when a page throws. The header and footer are left out on purpose:
// they could be what broke.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={`${bentoFontClasses} ${m.page}`}>
      <header className={`${m.sec} ${m.header}`}>
        <BrandLink />
      </header>
      <main className={`${m.sec} ${s.main}`}>
        <div className={s.grid} aria-hidden="true">
          <i />
          <i className={s.empty} />
          <i />
        </div>
        <p className={s.code}>Error</p>
        <h1 className={s.title}>
          Something broke <span className={m.ser}>on our side.</span>
        </h1>
        <p className={s.text}>
          Your page and your data are fine. Try again, and if it keeps happening, tell us at{" "}
          <a href="mailto:hello@bentofolio.dev">hello@bentofolio.dev</a>.
        </p>
        <div className={s.actions}>
          <button type="button" onClick={reset} className={`${m.btn} ${m.btnDark}`}>
            Try again
          </button>
          <Link href="/" className={`${m.btn} ${m.btnGhost}`}>
            Go home
          </Link>
        </div>
        {error.digest && <p className={s.digest}>Reference: {error.digest}</p>}
      </main>
    </div>
  );
}
