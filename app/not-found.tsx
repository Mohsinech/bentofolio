import type { Metadata } from "next";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import { FooterLinks, MarketingHeader } from "@/app/components/marketing/Chrome";
import m from "@/app/components/marketing/marketing.module.css";
import { NotFoundHint } from "@/app/components/status/NotFoundHint";
import s from "@/app/components/status/status.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className={`${bentoFontClasses} ${m.page}`}>
      <MarketingHeader />
      <main className={`${m.sec} ${s.main}`}>
        <div className={s.grid} aria-hidden="true">
          <i />
          <i />
          <i className={s.empty} />
        </div>
        <p className={s.code}>404</p>
        <h1 className={s.title}>
          Nothing here <span className={m.ser}>yet.</span>
        </h1>
        <NotFoundHint />
      </main>
      <FooterLinks light />
    </div>
  );
}
