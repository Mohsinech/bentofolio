"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import type { BlockContent, BlockLayout, ThemeId } from "@/app/lib/types";
import { BentoGrid } from "@/app/components/bento/BentoGrid";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import { publicLayout, resolveLayout } from "@/app/components/bento/layout";
import styles from "@/app/components/bento/bento.module.css";
import { ShareButton } from "./ShareButton";

interface PublicProfileShellProps {
  username: string;
  isPro: boolean;
  theme: ThemeId;
  avatarUrl?: string | null;
  layout: BlockLayout[];
  layoutVersion?: number | null;
  content: Record<string, BlockContent>;
}

export function PublicProfileShell({
  username,
  isPro,
  theme,
  avatarUrl,
  layout,
  layoutVersion,
  content,
}: PublicProfileShellProps) {
  const visible = useMemo(
    () => publicLayout(resolveLayout(layout, layoutVersion), content, isPro),
    [layout, layoutVersion, content, isPro]
  );

  const identity = Object.values(content).find((block) => block?.type === "identity");
  const displayName =
    identity?.type === "identity" && identity.data.name?.trim() && identity.data.name.trim() !== "Your Name"
      ? identity.data.name.trim()
      : `@${username}`;

  return (
    <main className={`${styles.theme} ${styles.page} ${bentoFontClasses}`} data-theme={theme}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <span className={styles.brand}>
            {displayName}
            {isPro && (
              <span className={styles.verified} title="Verified" aria-label="Verified">
                <Check size={10} strokeWidth={3.2} aria-hidden="true" />
              </span>
            )}
          </span>
          <div className={styles.headerActions}>
            <ShareButton username={username} />
          </div>
        </header>

        {visible.length > 0 ? (
          <BentoGrid layout={visible} content={content} avatarUrl={avatarUrl} isPro={isPro} />
        ) : (
          <p className={styles.emptyPage}>This page is still being set up.</p>
        )}

        {!isPro && (
          <footer className={styles.footer}>
            <a href="/" className={styles.madeWith} aria-label="Made with BentoFolio">
              <span className={styles.madeWithMark} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              Made with bentofolio
            </a>
          </footer>
        )}
      </div>
    </main>
  );
}
