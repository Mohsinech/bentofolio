"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { themes, ThemeId } from "@/app/lib/types";
import styles from "./ThemeSelector.module.css";

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  isPro: boolean;
  onSelect: (theme: ThemeId) => void;
  compact?: boolean;
}

export function ThemeSelector({
  currentTheme,
  isPro,
  onSelect,
  compact = false,
}: ThemeSelectorProps) {
  const themeEntries = Object.entries(themes) as [
    ThemeId,
    (typeof themes)[ThemeId]
  ][];

  const handleSelect = (themeId: ThemeId, isPremium: boolean) => {
    if (isPremium && !isPro) {
      // Could open upgrade modal here
      return;
    }
    onSelect(themeId);
  };

  if (compact) {
    return (
      <div className={styles.compactGrid}>
        {themeEntries.map(([id, theme]) => {
          const isSelected = currentTheme === id;
          const isLocked = theme.isPremium && !isPro;

          return (
            <motion.button
              key={id}
              className={`${styles.compactItem} ${
                isSelected ? styles.selected : ""
              } ${isLocked ? styles.locked : ""}`}
              onClick={() => handleSelect(id, theme.isPremium)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ background: theme.preview }}
              title={theme.name}
            >
              {isSelected && <Check size={14} className={styles.checkIcon} />}
              {isLocked && <Lock size={10} className={styles.lockIcon} />}
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {themeEntries.map(([id, theme]) => {
        const isSelected = currentTheme === id;
        const isLocked = theme.isPremium && !isPro;

        return (
          <motion.button
            key={id}
            className={`${styles.themeCard} ${
              isSelected ? styles.selected : ""
            } ${isLocked ? styles.locked : ""}`}
            onClick={() => handleSelect(id, theme.isPremium)}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Preview */}
            <div
              className={styles.preview}
              style={{ background: theme.preview }}
            >
              {/* Mini card preview */}
              <div
                className={styles.miniCard}
                style={{
                  background: theme.cardBackground,
                  borderColor: theme.cardBorder,
                }}
              />
              <div
                className={styles.miniCard}
                style={{
                  background: theme.cardBackground,
                  borderColor: theme.cardBorder,
                }}
              />

              {/* Status badges */}
              {isSelected && (
                <div className={styles.selectedBadge}>
                  <Check size={12} />
                  Active
                </div>
              )}
              {isLocked && (
                <div className={styles.lockedBadge}>
                  <Lock size={12} />
                  Pro
                </div>
              )}
              {!theme.isPremium && <div className={styles.freeBadge}>Free</div>}
            </div>

            {/* Info */}
            <div className={styles.info}>
              <span className={styles.themeName}>{theme.name}</span>
              <span className={styles.themeDesc}>{theme.description}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
