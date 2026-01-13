"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import styles from "./Watermark.module.css";

interface WatermarkProps {
  show: boolean;
}

export function Watermark({ show }: WatermarkProps) {
  if (!show) return null;

  return (
    <Link href="/" className={styles.watermark} target="_blank">
      <span className={styles.text}>Made with</span>
      <span className={styles.brand}>
        Bento<span className={styles.accent}>Folio</span>
      </span>
      <Sparkles size={12} className={styles.icon} />
    </Link>
  );
}
