"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  X,
  Sparkles,
  Zap,
  Github,
  FolderGit2,
  DollarSign,
  Music2,
  Briefcase,
  TrendingUp,
  Loader2,
  Palette,
} from "lucide-react";
import { useAuth } from "@/app/lib/hooks/useAuth";
import { useCheckout } from "@/app/lib/hooks/useCheckout";
import styles from "./pricing.module.css";

const features = {
  free: [
    { name: "Basic blocks (10 types)", included: true },
    { name: "Projects showcase", included: true },
    { name: "Instagram integration", included: true },
    { name: "Resume block", included: true },
    { name: "1 theme (Midnight)", included: true },
    { name: "Public profile", included: true },
    { name: "GitHub import", included: true },
    { name: '"Made with BentoFolio" badge', included: true },
    { name: "Premium themes (10+)", included: false },
    { name: "Premium blocks (9 types)", included: false },
    { name: "Custom domain", included: false },
    { name: "Profile analytics", included: false },
  ],
  pro: [
    { name: "All basic blocks (10 types)", included: true },
    { name: "All premium blocks (9 types)", included: true },
    { name: "All premium themes (10+)", included: true, highlight: true },
    { name: "GitHub Stats block", included: true },
    { name: "SaaS metrics block", included: true },
    { name: "Experience timeline", included: true },
    { name: "Career timeline", included: true },
    { name: "Spotify integration", included: true },
    { name: "YouTube embed", included: true },
    { name: "Network stats", included: true },
    { name: "Custom domain", included: true, highlight: true },
    { name: "Profile analytics", included: true },
    { name: "No watermark", included: true },
    { name: "Priority support", included: true },
  ],
};

const premiumBlocksPreview = [
  {
    icon: <Github size={20} />,
    name: "GitHub Stats",
    desc: "Show your coding activity",
  },
  {
    icon: <Music2 size={20} />,
    name: "Spotify",
    desc: "What you're listening to",
  },
  {
    icon: <DollarSign size={20} />,
    name: "SaaS Metrics",
    desc: "Display MRR & growth",
  },
  {
    icon: <Briefcase size={20} />,
    name: "Experience",
    desc: "Professional timeline",
  },
  {
    icon: <TrendingUp size={20} />,
    name: "Career",
    desc: "Your career journey",
  },
  {
    icon: <TrendingUp size={20} />,
    name: "Metrics",
    desc: "Custom stats & numbers",
  },
];

export default function PricingPage() {
  const { user, hasProAccess } = useAuth();
  const { initiateCheckout, loading, error } = useCheckout();

  const handleUpgrade = () => {
    if (!user) {
      // Redirect to signup if not logged in
      window.location.href = "/auth/signup";
      return;
    }
    initiateCheckout();
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back
        </Link>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.title}>
            Simple pricing,
            <br />
            <span className={styles.accent}>powerful portfolio</span>
          </h1>
          <p className={styles.subtitle}>
            One-time payment. Lifetime access. No subscriptions.
          </p>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className={styles.pricing}>
        {/* Free Plan */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.cardHeader}>
            <span className={styles.planName}>Free</span>
            <div className={styles.priceRow}>
              <span className={styles.price}>$0</span>
              <span className={styles.priceLabel}>forever</span>
            </div>
            <p className={styles.planDesc}>Perfect to get started</p>
          </div>

          <ul className={styles.featureList}>
            {features.free.map((feature, i) => (
              <li
                key={i}
                className={
                  feature.included ? styles.included : styles.notIncluded
                }
              >
                {feature.included ? (
                  <Check size={16} className={styles.checkIcon} />
                ) : (
                  <X size={16} className={styles.xIcon} />
                )}
                {feature.name}
              </li>
            ))}
          </ul>

          <Link href="/auth/signup" className={styles.freeButton}>
            Get Started Free
          </Link>
        </motion.div>

        {/* Pro Plan */}
        <motion.div
          className={`${styles.card} ${styles.proCard}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.proBadge}>
            <Sparkles size={14} />
            Most Popular
          </div>

          <div className={styles.cardHeader}>
            <span className={styles.planName}>Pro</span>
            <div className={styles.priceRow}>
              <span className={styles.price}>$29</span>
              <span className={styles.priceLabel}>one-time</span>
            </div>
            <p className={styles.planDesc}>Everything you need</p>
          </div>

          <ul className={styles.featureList}>
            {features.pro.map((feature, i) => (
              <li
                key={i}
                className={`${styles.included} ${
                  feature.highlight ? styles.highlight : ""
                }`}
              >
                <Check size={16} className={styles.checkIcon} />
                {feature.name}
                {feature.highlight && (
                  <Zap size={12} className={styles.zapIcon} />
                )}
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
                You have Pro
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Get Pro — $29
              </>
            )}
          </button>

          {error && <span className={styles.error}>{error}</span>}
          <span className={styles.guarantee}>30-day money-back guarantee</span>
        </motion.div>
      </section>

      {/* Premium Blocks Preview */}
      <section className={styles.blocksSection}>
        <h2 className={styles.sectionTitle}>Premium Blocks</h2>
        <p className={styles.sectionDesc}>
          Unlock powerful blocks to showcase your work
        </p>

        <div className={styles.blocksGrid}>
          {premiumBlocksPreview.map((block, i) => (
            <motion.div
              key={i}
              className={styles.blockPreview}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <div className={styles.blockIcon}>{block.icon}</div>
              <span className={styles.blockName}>{block.name}</span>
              <span className={styles.blockDesc}>{block.desc}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Themes Preview */}
      <section className={styles.themesSection}>
        <h2 className={styles.sectionTitle}>10+ Premium Themes</h2>
        <p className={styles.sectionDesc}>
          Find the perfect look for your personality
        </p>

        <Link href="/themes" className={styles.themesLink}>
          <Palette size={16} />
          Browse all themes
        </Link>
      </section>

      {/* FAQ */}
      <section className={styles.faq}>
        <h2 className={styles.sectionTitle}>Questions?</h2>
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h3>Is this really one-time?</h3>
            <p>Yes! Pay once, use forever. No monthly fees, no hidden costs.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>Can I upgrade later?</h3>
            <p>
              Absolutely! Start free and upgrade whenever you&apos;re ready.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3>What&apos;s the refund policy?</h3>
            <p>30-day money-back guarantee, no questions asked.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>Do I get future updates?</h3>
            <p>Yes! All future themes and features are included.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Ready to stand out?</h2>
        <p>Join thousands of professionals showcasing their work</p>
        <div className={styles.ctaButtons}>
          <Link href="/auth/signup" className={styles.ctaFree}>
            Start Free
          </Link>
          <button className={styles.ctaPro}>
            <Sparkles size={16} />
            Get Pro — $29
          </button>
        </div>
      </section>
    </div>
  );
}
