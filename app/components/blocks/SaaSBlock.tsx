"use client";

import { motion } from "framer-motion";
import { ExternalLink, DollarSign } from "lucide-react";
import styles from "./SaaSBlock.module.css";
import { SaaSContent } from "@/app/lib/types";

interface SaaSBlockProps {
  data: SaaSContent;
}

// Mini sparkline chart component
function SparklineChart({
  data,
  color = "#a855f7",
}: {
  data: number[];
  color?: string;
}) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const width = 100;
  const height = 40;
  const padding = 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y =
      height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  // Create area fill path
  const areaD = `${pathD} L ${width - padding},${
    height - padding
  } L ${padding},${height - padding} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={styles.chart}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={`gradient-${color.replace("#", "")}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <motion.path
        d={areaD}
        fill={`url(#gradient-${color.replace("#", "")})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />

      {/* Line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}

function formatCurrency(value: number, currency = "$") {
  if (value >= 1000000) {
    return `${currency}${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${currency}${(value / 1000).toFixed(1)}k`;
  }
  return `${currency}${value}`;
}

export function SaaSBlock({ data }: SaaSBlockProps) {
  const { name, logo, tagline, url, mrr, revenue, currency = "$" } = data;

  // Empty state
  if (!name) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.empty}>
          <DollarSign size={24} />
          <span>Add your SaaS details...</span>
        </div>
      </div>
    );
  }

  // Determine chart color based on trend
  const isGrowing =
    revenue &&
    revenue.length >= 2 &&
    revenue[revenue.length - 1] > revenue[revenue.length - 2];
  const chartColor = isGrowing ? "#22c55e" : "#a855f7";

  // Auto-generate favicon URL from the SaaS URL if no logo provided
  const getFaviconUrl = (siteUrl: string) => {
    try {
      const domain = new URL(siteUrl).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const displayLogo = logo || getFaviconUrl(url);

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.wrapper}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
          {displayLogo ? (
            <img src={displayLogo} alt={name} className={styles.logo} />
          ) : (
            <div className={styles.logoPlaceholder}>
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{name}</span>
            <ExternalLink size={12} className={styles.externalIcon} />
          </div>
          <span className={styles.tagline}>{tagline}</span>
        </div>

        <div className={styles.mrr}>
          <span className={styles.mrrValue}>
            {formatCurrency(mrr, currency)}
          </span>
          <span className={styles.mrrLabel}>/mo</span>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <SparklineChart data={revenue} color={chartColor} />

        <div className={styles.chartLabels}>
          <span className={styles.chartMin}>
            {formatCurrency(Math.min(...revenue), currency)}
          </span>
          <span className={styles.chartMax}>
            {formatCurrency(Math.max(...revenue), currency)}
          </span>
        </div>
      </div>
    </motion.a>
  );
}
