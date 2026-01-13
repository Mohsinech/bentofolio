"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import styles from "./IdentityBlock.module.css";
import { IdentityContent } from "@/app/lib/types";

interface IdentityBlockProps {
  data: IdentityContent;
}

function AvatarWithFallback({ src, name }: { src?: string; name: string }) {
  const [imgError, setImgError] = useState(false);

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

  if (imgError || !src) {
    return (
      <motion.div
        className={styles.avatarFallback}
        style={{ backgroundColor: getColor(name || "user") }}
        whileHover={{ scale: 1.08, rotate: 3 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {initials || <User size={32} />}
      </motion.div>
    );
  }

  return (
    <motion.img
      src={src}
      alt={name}
      className={styles.avatar}
      onError={() => setImgError(true)}
      whileHover={{ scale: 1.08, rotate: 3 }}
      transition={{ type: "spring", stiffness: 300 }}
    />
  );
}

export function IdentityBlock({ data }: IdentityBlockProps) {
  return (
    <div className={styles.container}>
      <AvatarWithFallback src={data.avatar} name={data.name} />
      <div>
        <h1 className={styles.name}>{data.name || "Your Name"}</h1>
        <p className={styles.title}>{data.title || "Your Title"}</p>
      </div>
      {data.bio && <p className={styles.bio}>{data.bio}</p>}
      <div className={styles.status}>
        <span className={styles.statusDot} />
        Available for work
      </div>
    </div>
  );
}
