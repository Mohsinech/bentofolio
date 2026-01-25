"use client";

import { motion } from "framer-motion";
import {
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Dribbble,
  ExternalLink,
} from "lucide-react";
import styles from "./LinkBlock.module.css";
import { LinkContent } from "@/app/lib/types";
import { cn } from "@/app/lib/utils";

interface LinkBlockProps {
  data: LinkContent;
}

const iconMap: Record<string, React.ReactNode> = {
  github: <Github size={28} />,
  twitter: <Twitter size={28} />,
  linkedin: <Linkedin size={28} />,
  youtube: <Youtube size={28} />,
  dribbble: <Dribbble size={28} />,
};

export function LinkBlock({ data }: LinkBlockProps) {
  // Empty state
  if (!data.url && !data.title) {
    return (
      <div
        className={cn(styles.container, styles.default, styles.empty)}
        style={{ fontFamily: "var(--font-montreal), system-ui" }}
      >
        <div className={styles.content}>
          <span className={styles.icon}>
            <ExternalLink size={28} />
          </span>
          <span className={styles.title}>Add a link...</span>
        </div>
      </div>
    );
  }

  const icon =
    data.icon && iconMap[data.icon] ? (
      iconMap[data.icon]
    ) : (
      <ExternalLink size={28} />
    );
  const colorClass =
    data.icon && styles[data.icon] ? styles[data.icon] : styles.default;

  return (
    <motion.a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(styles.container, colorClass)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ fontFamily: "var(--font-mori), system-ui" }}
    >
      <div className={styles.content}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.title}>{data.title || "Untitled Link"}</span>
      </div>
    </motion.a>
  );
}
