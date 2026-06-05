"use client";

import { Sparkles } from "lucide-react";
import { ServicesContent } from "@/app/lib/types";
import styles from "./ServicesBlock.module.css";

export function ServicesBlock({ data }: { data: ServicesContent }) {
  const items = (data.items || []).filter(Boolean).slice(0, 8);

  return (
    <div className={styles.container}>
      <span className={styles.kicker}>Services</span>
      <h3>{data.title || "What I can help with"}</h3>
      <div className={styles.tags}>
        {items.map((item) => (
          <span key={item}>
            <Sparkles size={12} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
