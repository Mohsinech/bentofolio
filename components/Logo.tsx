"use client";

import styles from "./Logo.module.css";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  return (
    <span className={`${styles.logo} ${styles[size]} ${className}`}>
      <span className={styles.bento}>bento</span>
      <span className={styles.folio}>folio</span>
    </span>
  );
}
