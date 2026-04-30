"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
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
          <div className={styles.themeSection}>
            <span className={styles.sectionLabel}>Included</span>
            {themeEntries.map(([id, theme]) => (
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
        </aside>

        {/* Live Preview */}
        <main className={styles.previewArea}>
          <div className={styles.previewHeader}>
            <span className={styles.previewTitle}>{currentTheme.name}</span>
            <span className={styles.previewSubtitle}>
              {currentTheme.description}
            </span>
          </div>
          <ThemePreview theme={currentTheme} />
        </main>
      </div>
    </div>
  );
}
