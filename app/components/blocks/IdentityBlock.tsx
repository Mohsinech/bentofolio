"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import NextImage from "next/image";
import {
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  User,
} from "lucide-react";
import styles from "./IdentityBlock.module.css";
import { IdentityContent } from "@/app/lib/types";
import { DEFAULT_MEMOJI_AVATAR } from "@/app/lib/memoji";

interface IdentityBlockProps {
  data: IdentityContent;
  verified?: boolean;
}

function VerifiedBadge() {
  return (
    <NextImage
      className={styles.verified}
      src="/icons/verify.png"
      alt="Verified Pro profile"
      width={22}
      height={22}
      aria-label="Verified Pro profile"
    />
  );
}

function AvatarWithFallback({ src, name }: { src?: string; name: string }) {
  const [imgError, setImgError] = useState(false);
  const [defaultImgError, setDefaultImgError] = useState(false);
  const imageSrc = src || DEFAULT_MEMOJI_AVATAR;
  const activeSrc = imgError ? DEFAULT_MEMOJI_AVATAR : imageSrc;
  const shouldShowInitials =
    (imgError && defaultImgError) || (!src && defaultImgError);

  // Generate initials
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  // Generate color from name
  const getColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "#6366f1",
      "#8b5cf6",
      "#a855f7",
      "#ec4899",
      "#f43f5e",
      "#10b981",
      "#06b6d4",
      "#3b82f6",
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  if (shouldShowInitials) {
    return (
      <motion.div
        className={styles.avatarFallback}
        style={{ backgroundColor: getColor(name || "user") }}
        whileHover={{ scale: 1.08, rotate: 3 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {initials || <User size={26} />}
      </motion.div>
    );
  }

  return (
    <motion.img
      src={activeSrc}
      alt={name}
      className={`${styles.avatar} ${
        activeSrc === DEFAULT_MEMOJI_AVATAR ? styles.memojiAvatar : ""
      }`}
      onError={() => {
        if (activeSrc === DEFAULT_MEMOJI_AVATAR) {
          setDefaultImgError(true);
          return;
        }
        setImgError(true);
      }}
      whileHover={{ scale: 1.08, rotate: 3 }}
      transition={{ type: "spring", stiffness: 300 }}
    />
  );
}

export function IdentityBlock({ data, verified = false }: IdentityBlockProps) {
  const websiteHref = data.website
    ? data.website.startsWith("http")
      ? data.website
      : `https://${data.website}`
    : "";

  const contactItems = [
    data.location
      ? {
          label: data.location,
          href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.location)}`,
          icon: <MapPin size={14} />,
        }
      : null,
    data.email
      ? {
          label: "Email",
          href: `mailto:${data.email}`,
          icon: <Mail size={14} />,
        }
      : null,
    data.website
      ? {
          label: data.website.replace(/^https?:\/\//, ""),
          href: websiteHref,
          icon: <Globe size={14} />,
        }
      : null,
  ].filter(Boolean) as { label: string; href: string; icon: ReactNode }[];

  return (
    <div className={styles.container}>
      <div className={styles.infoCard}>
        <div className={styles.kicker}>
          <span className={styles.statusDot} />
          {data.availability || "Available"}
        </div>
        <div className={styles.nameRow}>
          <h1 className={styles.name}>{data.name || "Your Name"}</h1>
          {verified && <VerifiedBadge />}
        </div>
        <p className={styles.title}>{data.title || "Your Title"}</p>
        {data.bio && <p className={styles.bio}>{data.bio}</p>}

        {contactItems.length > 0 && (
          <div className={styles.metaGrid}>
            {contactItems.slice(0, 3).map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className={styles.metaItem}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.href.startsWith("http") && (
                  <ExternalLink size={11} className={styles.externalIcon} />
                )}
              </motion.a>
            ))}
          </div>
        )}
      </div>

      <div className={styles.avatarCard}>
        <AvatarWithFallback src={data.avatar} name={data.name} />
      </div>
    </div>
  );
}
