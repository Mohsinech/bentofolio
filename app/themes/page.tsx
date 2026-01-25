"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Check, Lock, Sparkles, Zap } from "lucide-react";
import { themes, ThemeId, ThemeConfig } from "@/app/lib/types";
import styles from "./themes.module.css";

// Demo blocks to show in preview
const demoBlocks = [
  { type: "identity", w: 2, h: 1 },
  { type: "github", w: 2, h: 1 },
  { type: "map", w: 1, h: 1 },
  { type: "techstack", w: 1, h: 1 },
  { type: "social", w: 2, h: 1 },
  { type: "projects", w: 2, h: 2 },
];

function ThemePreview({ theme }: { theme: ThemeConfig }) {
  return (
    <div
      className={styles.previewGrid}
      style={
        {
          background: theme.background,
          "--card-bg": theme.cardBackground,
          "--card-border": theme.cardBorder,
          "--text": theme.text,
          "--text-muted": theme.textMuted,
          "--accent": theme.accent,
        } as React.CSSProperties
      }
    >
      {demoBlocks.map((block, i) => (
        <motion.div
          key={i}
          className={styles.previewBlock}
          style={{
            gridColumn: `span ${block.w}`,
            gridRow: `span ${block.h}`,
            background: theme.cardBackground,
            borderColor: theme.cardBorder,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className={styles.blockLabel} style={{ color: theme.textMuted }}>
            {block.type}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function ThemesPage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("dark");
  const themeEntries = Object.entries(themes) as [ThemeId, ThemeConfig][];
  const currentTheme = themes[selectedTheme];

  const freeThemes = themeEntries.filter(([, t]) => !t.isPremium);
  const premiumThemes = themeEntries.filter(([, t]) => t.isPremium);

  return (
    <div
      className={styles.container}
      style={{ fontFamily: "var(--font-mori), sans-serif" }}
    >
      {/* Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back
        </Link>
        <h1
          className={styles.title}
          style={{ fontFamily: "var(--font-montreal), sans-serif" }}
        >
          Choose Your <span className={styles.accent}>Theme</span>
        </h1>
        <p
          className={styles.subtitle}
          style={{ fontFamily: "var(--font-mori), sans-serif" }}
        >
          Preview all themes and find the perfect look for your portfolio
        </p>
      </header>

      <div className={styles.content}>
        {/* Theme List */}
        <aside className={styles.themeList}>
          {/* Free Themes */}
          <div className={styles.themeSection}>
            <span className={styles.sectionLabel}>Free</span>
            {freeThemes.map(([id, theme]) => (
              <button
                key={id}
                className={`${styles.themeButton} ${
                  selectedTheme === id ? styles.active : ""
                }`}
                onClick={() => setSelectedTheme(id)}
              >
                <div
                  className={styles.themePreviewDot}
                  style={{ background: theme.preview }}
                />
                <div className={styles.themeInfo}>
                  <span className={styles.themeName}>{theme.name}</span>
                  <span className={styles.themeDesc}>{theme.description}</span>
                </div>
                {selectedTheme === id && (
                  <Check size={16} className={styles.checkMark} />
                )}
              </button>
            ))}
          </div>

          {/* Premium Themes */}
          <div className={styles.themeSection}>
            <span className={styles.sectionLabel}>
              <Sparkles size={14} />
              Premium
            </span>
            {premiumThemes.map(([id, theme]) => (
              <button
                key={id}
                className={`${styles.themeButton} ${
                  selectedTheme === id ? styles.active : ""
                }`}
                onClick={() => setSelectedTheme(id)}
              >
                <div
                  className={styles.themePreviewDot}
                  style={{ background: theme.preview }}
                />
                <div className={styles.themeInfo}>
                  <span className={styles.themeName}>{theme.name}</span>
                  <span className={styles.themeDesc}>{theme.description}</span>
                </div>
                {selectedTheme === id ? (
                  <Check size={16} className={styles.checkMark} />
                ) : (
                  <Lock size={14} className={styles.lockMark} />
                )}
              </button>
            ))}
          </div>

          {/* Upgrade CTA */}
          <div className={styles.upgradeCta}>
            <Zap size={20} />
            <div>
              <strong>Unlock all themes</strong>
              <p>Get Pro for $29 one-time</p>
            </div>
            <Link href="/pricing" className={styles.upgradeButton}>
              Upgrade
            </Link>
          </div>
        </aside>

        {/* Live Preview */}
        <main className={styles.previewArea}>
          <div className={styles.previewHeader}>
            <span className={styles.previewTitle}>{currentTheme.name}</span>
            <span className={styles.previewSubtitle}>
              {currentTheme.description}
            </span>
            {currentTheme.isPremium && (
              <span className={styles.proBadge}>
                <Sparkles size={12} />
                Pro
              </span>
            )}
          </div>
          <ThemePreview theme={currentTheme} />
        </main>
      </div>
    </div>
  );
}
