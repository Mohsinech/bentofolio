"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  Globe,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/app/lib/hooks/useAuth";
import { useCheckout } from "@/app/lib/hooks/useCheckout";
import { useProfile } from "@/app/lib/hooks/useProfile";
import { PREMIUM_PRICE } from "@/app/lib/config";
import styles from "./pricing.module.css";

const freeFeatures = [
  "Identity, work, stack, social, link, resume, quote, education, and tools",
  "Public bentofolio.dev profile",
  "Dark and light themes",
  "Editable bento canvas",
  "Good for a focused starter portfolio",
];

const proFeatures = [
  "Connect your own custom domain",
  "Verification badge beside your name",
  "Analytics dashboard",
  "Premium blocks: GitHub, Projects, SaaS, Spotify, YouTube, Gallery, Instagram, Services, Stats",
  "Pro templates for creators, developers, and product launches",
  "Lifetime access for one payment",
  "Keep every free block and future polish",
];

const betaFreeCodes = ["NAOUMI100", "OUAZINI100"];

export default function PricingPage() {
  const { user } = useAuth();
  const { hasProAccess } = useProfile();
  const { initiateCheckout, loading, error } = useCheckout();
  const [couponCode, setCouponCode] = useState("");
  const normalizedCouponCode = couponCode.trim().toUpperCase();
  const isFreeBetaCode =
    betaFreeCodes.includes(normalizedCouponCode) ||
    normalizedCouponCode.startsWith("COUPON100-");

  const handleUpgrade = () => {
    if (!user) {
      window.location.href = "/auth/signup";
      return;
    }

    initiateCheckout(couponCode);
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={18} />
          BentoFolio
        </Link>
        <nav>
          <Link href="/contact">Contact</Link>
          <Link href="/auth/login">Log in</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <motion.div
          className={styles.heroCopy}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <span className={styles.eyebrow}>
            <Sparkles size={14} />
            Beta lifetime deal
          </span>
          <h1 className={styles.title}>
            Launch free. Own Pro for ${PREMIUM_PRICE}.
          </h1>
          <p className={styles.subtitle}>
            Start with the essential BentoFolio canvas. Upgrade when you want
            richer proof blocks, analytics, templates, and your own domain.
            Beta Pro is one payment while the product is young.
          </p>
        </motion.div>
      </section>

      <section className={styles.valueStrip}>
        <span>
          <Lock size={15} />
          Pro features are clearly locked in the editor
        </span>
        <span>
          <BarChart3 size={15} />
          Analytics and growth blocks stay Pro
        </span>
        <span>
          <Globe size={15} />
          Custom domains for owned presence
        </span>
      </section>

      <section className={styles.pricing}>
        <motion.article
          className={styles.card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className={styles.cardHeader}>
            <span className={styles.planName}>Free</span>
            <div className={styles.priceRow}>
              <span className={styles.price}>$0</span>
              <span className={styles.priceLabel}>forever</span>
            </div>
            <p className={styles.planDesc}>
              Build, publish, and share your work without fighting a paywall.
            </p>
          </div>

          <ul className={styles.featureList}>
            {freeFeatures.map((feature) => (
              <li key={feature}>
                <Check size={16} />
                {feature}
              </li>
            ))}
          </ul>

          <Link href="/auth/signup" className={styles.freeButton}>
            Start building
            <ArrowRight size={16} />
          </Link>
        </motion.article>

        <motion.article
          className={`${styles.card} ${styles.proCard}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <div className={styles.proBadge}>
            <Globe size={14} />
            Custom domain
          </div>

          <div className={styles.cardHeader}>
            <span className={styles.planName}>Beta Pro</span>
            <div className={styles.priceRow}>
              <span className={styles.price}>${PREMIUM_PRICE}</span>
              <span className={styles.priceLabel}>lifetime beta</span>
            </div>
            <p className={styles.planDesc}>
              One payment for your own domain, analytics, and richer
              proof-of-work blocks. Early users can be activated manually while
              checkout is being approved.
            </p>
          </div>

          <ul className={styles.featureList}>
            {proFeatures.map((feature) => (
              <li key={feature}>
                <Check size={16} />
                {feature}
              </li>
            ))}
          </ul>

          <label className={styles.couponField}>
            <span>Beta coupon</span>
            <input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              placeholder="BETA90 or invite code"
              spellCheck={false}
            />
          </label>

          <button
            className={styles.proButton}
            onClick={handleUpgrade}
            disabled={loading || hasProAccess}
          >
            {loading ? (
              <Loader2 size={16} className={styles.spinner} />
            ) : hasProAccess ? (
              <>
                <Check size={16} />
                Pro active
              </>
            ) : (
              <>
                <Globe size={16} />
                {isFreeBetaCode ? "Get Pro for free" : `Get Pro — $${PREMIUM_PRICE}`}
              </>
            )}
          </button>

          {error && <span className={styles.error}>{error}</span>}
        </motion.article>
      </section>

      <section className={styles.creativeSection}>
        <div className={styles.creativeCard}>
          <div className={styles.creativeIcon}>
            <Sparkles size={22} />
          </div>
          <div>
            <h2>Free stays useful. Pro adds leverage.</h2>
            <p>
              The free plan is enough to publish a polished profile. Pro is for
              people who want more proof, more media, analytics, and domain
              ownership.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
