// Loading placeholders: the shape of the page that's coming, instead of a
// spinner on a blank screen. Screen readers hear one "Loading" label.

import type { CSSProperties } from "react";
import styles from "./skeleton.module.css";

export function Bone({
  w = "100%",
  h = 12,
  round = false,
  className = "",
  style,
}: {
  w?: number | string;
  h?: number | string;
  round?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`${styles.bone} ${round ? styles.round : ""} ${className}`}
      style={{ width: w, height: h, ...style }}
      aria-hidden="true"
    />
  );
}

function Busy({ label }: { label: string }) {
  return (
    <span className={styles.srOnly} role="status">
      {label}
    </span>
  );
}

// The editor's frame: top bar, block library, canvas with a few blocks, inspector.
export function EditorSkeleton({ className = "" }: { className?: string }) {
  return (
    <main className={`${styles.root} ${styles.editor} ${className}`} aria-busy="true">
      <Busy label="Opening your editor" />
      <div className={styles.editorTop}>
        <Bone w={26} h={26} />
        <Bone w={190} h={14} />
        <div className={styles.editorTopRight}>
          <Bone w={84} h={32} />
          <Bone w={84} h={32} />
          <Bone w={92} h={32} />
        </div>
      </div>
      <div className={styles.editorBody}>
        <aside className={styles.editorSide}>
          <Bone w={90} h={11} />
          <Bone h={34} />
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={styles.listRow}>
              <Bone w={30} h={30} />
              <Bone w={`${50 + ((i * 17) % 35)}%`} h={11} />
            </div>
          ))}
        </aside>
        <div className={`${styles.editorCanvas} ${styles.fadeIn}`}>
          <div className={styles.bentoGrid}>
            <Bone className={styles.w4} h="100%" />
            <Bone className={styles.w2} h="100%" />
            <Bone h="100%" />
            <Bone h="100%" />
            <Bone className={`${styles.w2} ${styles.h2}`} h="100%" />
            <Bone className={styles.w2} h="100%" />
            <Bone className={styles.w2} h="100%" />
          </div>
        </div>
        <aside className={styles.editorSide}>
          <Bone w={110} h={11} />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <Bone w={70} h={10} />
              <Bone h={36} />
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}

// Stacked cards for settings, invite and similar pages.
export function SectionsSkeleton({ sections = 3, label = "Loading" }: { sections?: number; label?: string }) {
  return (
    <div className={`${styles.root} ${styles.sections} ${styles.fadeIn}`} aria-busy="true">
      <Busy label={label} />
      {Array.from({ length: sections }, (_, i) => (
        <div key={i} className={styles.section}>
          <Bone w={120} h={11} />
          <Bone w="60%" h={18} />
          <Bone w="85%" h={11} />
          <Bone h={40} style={{ marginTop: 4 }} />
        </div>
      ))}
    </div>
  );
}

// Number tiles and two panels, for analytics.
export function StatsSkeleton() {
  return (
    <div className={`${styles.root} ${styles.sections} ${styles.fadeIn}`} aria-busy="true">
      <Busy label="Loading your numbers" />
      <div className={styles.tiles}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={styles.tile}>
            <Bone w={70} h={10} />
            <Bone w={90} h={28} />
            <Bone w={60} h={10} />
          </div>
        ))}
      </div>
      <div className={styles.section}>
        <Bone w={100} h={11} />
        <Bone h={180} />
      </div>
      <div className={styles.tiles}>
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className={styles.tile}>
            <Bone w={90} h={11} />
            {Array.from({ length: 4 }, (_, j) => (
              <Bone key={j} w={`${90 - j * 15}%`} h={12} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Discover's page cards.
export function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className={`${styles.root} ${styles.cards} ${styles.fadeIn}`} aria-busy="true">
      <li className={styles.srOnly} role="status">
        Loading pages
      </li>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={styles.card} aria-hidden="true">
          <Bone w={48} h={48} round />
          <Bone w="55%" h={16} />
          <Bone w="85%" h={11} />
          <Bone h={52} />
          <Bone w="45%" h={10} />
        </li>
      ))}
    </ul>
  );
}
