"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GitFork, Star, Users, BookOpen, Github } from "lucide-react";
import styles from "./GitHubBlock.module.css";
import { GitHubContent } from "@/app/lib/types";

interface GitHubBlockProps {
  data: GitHubContent;
}

function formatNumber(num: number): string {
  if (!num) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

export function GitHubBlock({ data }: GitHubBlockProps) {
  const [imgError, setImgError] = useState(false);
  const { username, avatarUrl, followers, following, publicRepos, totalStars } =
    data;

  // Fallback for no username
  if (!username) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.empty}>
          <Github size={32} />
          <span>Add your GitHub username</span>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: <Users size={14} />, value: followers || 0, label: "Followers" },
    { icon: <BookOpen size={14} />, value: publicRepos || 0, label: "Repos" },
    { icon: <Star size={14} />, value: totalStars || 0, label: "Stars" },
  ];

  return (
    <motion.a
      href={`https://github.com/${username}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.wrapper}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={styles.header}>
        <div className={styles.avatar}>
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt={username}
              className={styles.avatarImg}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <Github size={24} />
            </div>
          )}
        </div>
        <div className={styles.info}>
          <span className={styles.username}>@{username}</span>
          <span className={styles.label}>GitHub</span>
        </div>
      </div>

      <div className={styles.stats}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className={styles.stat}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <span className={styles.statIcon}>{stat.icon}</span>
            <span className={styles.statValue}>{formatNumber(stat.value)}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.a>
  );
}
