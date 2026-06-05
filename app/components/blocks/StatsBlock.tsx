"use client";

import { TrendingUp } from "lucide-react";
import { StatsContent } from "@/app/lib/types";
import styles from "./StatsBlock.module.css";

export function StatsBlock({ data }: { data: StatsContent }) {
  const items = (data.items || []).slice(0, 4);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <TrendingUp size={15} />
        <span>Highlights</span>
      </div>
      <div className={styles.stats}>
        {items.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
