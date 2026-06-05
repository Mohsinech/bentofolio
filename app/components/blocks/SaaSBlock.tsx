"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, DollarSign } from "lucide-react";
import NextImage from "next/image";
import styles from "./SaaSBlock.module.css";
import { SaaSContent } from "@/app/lib/types";
import { IMAGE_PLACEHOLDER } from "@/app/lib/placeholders";

interface SaaSBlockProps {
  data: SaaSContent;
}

function SparklineChart({
  data,
  color = "var(--saas-chart-color)",
}: {
  data: number[];
  color?: string;
}) {
  const gradientId = `saas-chart-gradient-${useId().replace(/:/g, "")}`;
  const glowId = `saas-chart-glow-${useId().replace(/:/g, "")}`;

  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 180;
  const height = 106;
  const padding = 8;

  const points = data.map((value, index) => {
    const x =
      padding +
      (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y =
      height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const coords = points.map((point) => {
    const [x, y] = point.split(",").map(Number);
    return { x, y };
  });

  const pathD = coords.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x},${point.y}`;
    const previous = coords[index - 1];
    const midX = (previous.x + point.x) / 2;
    return `${path} C ${midX},${previous.y} ${midX},${point.y} ${point.x},${point.y}`;
  }, "");

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
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.34" />
          <stop offset="55%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className={styles.gridLines}>
        {[22, 48, 74].map((y) => (
          <line key={y} x1="0" y1={y} x2={width} y2={y} />
        ))}
      </g>

      <motion.path
        d={areaD}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />

      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {points.map((point, index) => {
        const [cx, cy] = point.split(",");
        const isLast = index === points.length - 1;
        return (
          <motion.circle
            key={`${point}-${index}`}
            cx={cx}
            cy={cy}
            r={isLast ? 4.2 : 0}
            fill={isLast ? "var(--saas-chart-dot)" : color}
            stroke={isLast ? color : "transparent"}
            strokeWidth={isLast ? 1.6 : 0}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: isLast ? 1 : 0.72 }}
            transition={{ delay: 0.55 + index * 0.04 }}
          />
        );
      })}
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
  const [failedLogoSrc, setFailedLogoSrc] = useState<string | null>(null);
  const { name, logo, tagline, url, mrr, revenue, currency = "$" } = data;

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

  const chartColor = "var(--saas-chart-color)";
  const logoCandidate = logo || IMAGE_PLACEHOLDER;
  const displayLogo =
    failedLogoSrc === logoCandidate ? IMAGE_PLACEHOLDER : logoCandidate;
  const host = url ? url.replace(/^https?:\/\//, "").replace(/\/$/, "") : "";

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.wrapper}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={styles.hero}>
        <span className={styles.kicker}>
          Revenue growth <ExternalLink size={14} />
        </span>
        <span className={styles.mrr}>
          {formatCurrency(mrr, currency)} MRR
        </span>
      </div>

      <div className={styles.chartWrapper}>
        <SparklineChart data={revenue} color={chartColor} />
      </div>

      <div className={styles.footer}>
        <div className={styles.logoWrapper}>
          <NextImage
            src={displayLogo}
            alt={name}
            width={34}
            height={34}
            className={styles.logo}
            onError={() => {
              if (displayLogo !== IMAGE_PLACEHOLDER) {
                setFailedLogoSrc(displayLogo);
              }
            }}
          />
        </div>
        <div className={styles.info}>
          <span className={styles.name}>{name}</span>
          <span className={styles.tagline}>{tagline}</span>
        </div>
        <span className={styles.host}>{host}</span>
      </div>
    </motion.a>
  );
}
