"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Globe,
  Loader2,
  NotebookTabs,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/app/lib/hooks/useAuth";
import { useCheckout } from "@/app/lib/hooks/useCheckout";
import { PREMIUM_PRICE } from "@/app/lib/config";
import styles from "./pricing.module.css";

const freeFeatures = [
  "All bento blocks",
  "Creative tab for Notion-style work sharing",
  "All themes while the new visual system evolves",
  "Public bentofolio.dev profile",
  "GitHub import and social links",
];

const proFeatures = [
  "Connect your own custom domain",
  "Lifetime access for one payment",
  "Keep every free creative feature",
];

export default function PricingPage() {
  const { user, hasProAccess } = useAuth();
  const { initiateCheckout, loading, error } = useCheckout();

  const handleUpgrade = () => {
    if (!user) {
      window.location.href = "/auth/signup";
      return;
    }

    initiateCheckout();
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={18} />
          Back
        </Link>
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
            Simple lifetime upgrade
          </span>
          <h1 className={styles.title}>Make the profile yours.</h1>
          <p className={styles.subtitle}>
            BentoFolio stays generous by default. Pro is only for creators who
            want their own domain.
          </p>
        </motion.div>
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
            <span className={styles.planName}>Pro</span>
            <div className={styles.priceRow}>
              <span className={styles.price}>${PREMIUM_PRICE}</span>
              <span className={styles.priceLabel}>lifetime</span>
            </div>
            <p className={styles.planDesc}>
              One payment to publish your portfolio on your own domain.
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
                Get Pro — ${PREMIUM_PRICE}
              </>
            )}
          </button>

          {error && <span className={styles.error}>{error}</span>}
        </motion.article>
      </section>

      <section className={styles.creativeSection}>
        <div className={styles.creativeCard}>
          <div className={styles.creativeIcon}>
            <NotebookTabs size={22} />
          </div>
          <div>
            <h2>Creative tab is included.</h2>
            <p>
              Use it like a public Notion desk: share case studies, notes,
              moodboards, experiments, and the thinking behind your work.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
