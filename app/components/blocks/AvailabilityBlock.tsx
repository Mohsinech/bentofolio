"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarClock,
  Clock3,
  Mail,
  TimerReset,
  WalletCards,
} from "lucide-react";
import styles from "./AvailabilityBlock.module.css";
import { AvailabilityContent } from "@/app/lib/types";

interface AvailabilityBlockProps {
  data: AvailabilityContent;
}

const statusConfig = {
  available: {
    label: "Available",
    headline: "Taking new work",
    tone: "green",
  },
  busy: {
    label: "Limited",
    headline: "Selective availability",
    tone: "amber",
  },
  "not-available": {
    label: "Booked",
    headline: "Not taking work",
    tone: "red",
  },
} as const;

function getContactHref(contact?: string) {
  if (!contact) return "";
  if (contact.includes("@") && !contact.startsWith("http")) {
    return `mailto:${contact}`;
  }
  return contact.startsWith("http") ? contact : `https://${contact}`;
}

export function AvailabilityBlock({ data }: AvailabilityBlockProps) {
  const validStatus = data.status && statusConfig[data.status] ? data.status : "available";
  const config = statusConfig[validStatus];
  const contactHref = getContactHref(data.preferredContact);
  const isExternal = contactHref.startsWith("http");

  const details = [
    data.nextOpening
      ? { icon: <CalendarClock size={14} />, label: "Next", value: data.nextOpening }
      : null,
    data.responseTime
      ? { icon: <TimerReset size={14} />, label: "Reply", value: data.responseTime }
      : null,
    data.timezone
      ? { icon: <Clock3 size={14} />, label: "Zone", value: data.timezone }
      : null,
    data.rate ? { icon: <WalletCards size={14} />, label: "Budget", value: data.rate } : null,
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  return (
    <div
      className={`${styles.wrapper} ${styles[config.tone]} ${
        data.forHire ? styles.forHire : ""
      }`}
    >
      <div className={styles.header}>
        <motion.div
          className={styles.orb}
          animate={
            validStatus === "available"
              ? { scale: [1, 1.08, 1], opacity: [0.82, 1, 0.82] }
              : {}
          }
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        >
          <span />
        </motion.div>
        <div>
          <span className={styles.eyebrow}>{config.label}</span>
          <h3>{config.headline}</h3>
        </div>
      </div>

      <p className={styles.message}>
        {data.message || "Open to selected collaborations and focused product work."}
      </p>

      {details.length > 0 && (
        <div className={styles.details}>
          {details.slice(0, 4).map((item) => (
            <div className={styles.detail} key={item.label}>
              {item.icon}
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      )}

      {contactHref ? (
        <motion.a
          href={contactHref}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className={styles.contactButton}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Mail size={14} />
          <span>{data.ctaLabel || "Get in touch"}</span>
          <ArrowUpRight size={14} />
        </motion.a>
      ) : (
        <div className={styles.contactButtonDisabled}>
          <Mail size={14} />
          <span>Add contact</span>
        </div>
      )}
    </div>
  );
}
