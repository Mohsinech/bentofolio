"use client";

import { motion } from "framer-motion";
import { Circle, Mail, MessageSquare } from "lucide-react";
import styles from "./AvailabilityBlock.module.css";
import { AvailabilityContent } from "@/app/lib/types";

interface AvailabilityBlockProps {
  data: AvailabilityContent;
}

const statusConfig = {
  available: {
    color: "#22c55e",
    label: "Available",
    bgColor: "rgba(34, 197, 94, 0.1)",
  },
  busy: {
    color: "#f59e0b",
    label: "Busy",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
  "not-available": {
    color: "#ef4444",
    label: "Not Available",
    bgColor: "rgba(239, 68, 68, 0.1)",
  },
};

export function AvailabilityBlock({ data }: AvailabilityBlockProps) {
  const { status, message, forHire, preferredContact } = data;

  // Ensure status is valid, default to 'available' if not
  const validStatus = status && statusConfig[status] ? status : "available";
  const config = statusConfig[validStatus];

  return (
    <div className={styles.wrapper}>
      <div className={styles.statusRow}>
        <motion.div
          className={styles.statusIndicator}
          style={{ backgroundColor: config.bgColor }}
          animate={status === "available" ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <motion.span
            className={styles.statusDot}
            style={{ backgroundColor: config.color }}
            animate={status === "available" ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <span className={styles.statusLabel} style={{ color: config.color }}>
            {config.label}
          </span>
        </motion.div>

        {forHire && <span className={styles.forHireBadge}>Open to work</span>}
      </div>

      {message && <p className={styles.message}>{message}</p>}

      {preferredContact && (
        <a
          href={
            preferredContact.includes("@")
              ? `mailto:${preferredContact}`
              : preferredContact
          }
          className={styles.contactButton}
          target={preferredContact.includes("@") ? undefined : "_blank"}
          rel={
            preferredContact.includes("@") ? undefined : "noopener noreferrer"
          }
        >
          <Mail size={14} />
          Get in touch
        </a>
      )}
    </div>
  );
}
