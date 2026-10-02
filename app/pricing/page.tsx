import type { Metadata } from "next";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import { FooterLinks, MarketingHeader } from "@/app/components/marketing/Chrome";
import styles from "@/app/components/marketing/marketing.module.css";
import { PREMIUM_PRICE } from "@/app/lib/config";
import { PlanCards } from "./PlanCards";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Publish your bento portfolio free. Pro is $${PREMIUM_PRICE} once: custom domain, analytics, embeds and the verified badge.`,
};

const rows: { f: string; free: string; pro: string; freeMuted?: boolean }[] = [
  { f: "Core blocks (GitHub, projects, experience…)", free: "✓", pro: "✓" },
  { f: "Verified revenue (Stripe, Lemon Squeezy)", free: "✓", pro: "✓" },
  { f: "Bento grid with drag and resize", free: "✓", pro: "✓" },
  { f: "Grid and CV views", free: "✓", pro: "✓" },
  { f: "Draft and publish", free: "✓", pro: "✓" },
  { f: "Spotify, YouTube, Instagram blocks", free: "—", pro: "✓", freeMuted: true },
  { f: "Custom domain", free: "—", pro: "✓", freeMuted: true },
  { f: "Analytics dashboard", free: "—", pro: "✓", freeMuted: true },
  { f: "Verified badge", free: "—", pro: "✓", freeMuted: true },
  { f: "CV as PDF download", free: "—", pro: "✓", freeMuted: true },
  { f: "“Made with” tag", free: "Shown", pro: "Removed" },
];

export default function PricingPage() {
  return (
    <div className={`${bentoFontClasses} ${styles.page}`}>
      <MarketingHeader active="pricing" />

      <main className={styles.main} style={{ gap: 72, paddingBottom: 96, marginTop: 72 }}>
        <section className={`${styles.sec} ${styles.narrow} ${styles.pricingHero}`}>
          <span className={styles.lbl}>Beta pricing</span>
          <h1 className={styles.pricingTitle}>
            Publish free. <span className={styles.ser}>Own it for ${PREMIUM_PRICE}.</span>
          </h1>
          <p className={styles.p} style={{ fontSize: 17, maxWidth: 520 }}>
            One payment while we’re in beta. No subscription, no renewals.
          </p>
        </section>

        <PlanCards />

        <section className={`${styles.sec} ${styles.narrow} ${styles.compare}`} aria-labelledby="compare-title">
          <div className={`${styles.tr} ${styles.trHead}`}>
            <span id="compare-title" className={styles.lbl}>
              Compare
            </span>
            <span className={styles.lbl}>Free</span>
            <span className={styles.lbl}>Pro</span>
          </div>
          {rows.map((row) => (
            <div key={row.f} className={styles.tr}>
              <span>{row.f}</span>
              <span className={row.freeMuted ? styles.no : undefined}>{row.free}</span>
              <span>{row.pro}</span>
            </div>
          ))}
        </section>

        <section className={`${styles.sec} ${styles.narrow} ${styles.notes}`} aria-label="Good to know">
          <div className={styles.note}>
            <b>Keep everything</b>
            <p className={styles.p}>Upgrading never changes your blocks or URL. Pro is lifetime: nothing to renew.</p>
          </div>
          <div className={styles.note}>
            <b>Beta price</b>
            <p className={styles.p}>
              Early users lock in ${PREMIUM_PRICE} for life. When the beta ends, Pro moves to a yearly plan.
            </p>
          </div>
          <div className={styles.note}>
            <b>Have a code?</b>
            <p className={styles.p}>Enter it above or at checkout. Codes are checked on our server, one use each.</p>
          </div>
        </section>
      </main>

      <FooterLinks light />
    </div>
  );
}
