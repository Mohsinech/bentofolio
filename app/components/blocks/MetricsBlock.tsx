"use client";

import { motion } from "framer-motion";
import { TrendingUp, BarChart3 } from "lucide-react";
import styles from "./MetricsBlock.module.css";
import { MetricsContent } from "@/app/lib/types";

interface MetricsBlockProps {
  data: MetricsContent;
}

export function MetricsBlock({ data }: MetricsBlockProps) {
  // Fallback for empty state
  if (!data.items || data.items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <TrendingUp size={14} />
          <span>Metrics</span>
        </div>
        <div className={styles.empty}>
          <BarChart3 size={32} />
          <span>Add your metrics</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <TrendingUp size={14} />
        <span>Metrics</span>
      </div>
      <div className={styles.grid}>
        {data.items.map((item, index) => (
          <motion.div
            key={`${item.label}-${index}`}
            className={styles.metric}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className={styles.value}>{item.value || "0"}</span>
            <span className={styles.label}>{item.label || "Metric"}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
