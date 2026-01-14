"use client";

import { Instagram } from "lucide-react";
import { InstagramContent } from "@/app/lib/types";
import styles from "./InstagramBlock.module.css";

interface InstagramBlockProps {
  data: InstagramContent;
}

// Extract username from Instagram profile URL
function getInstagramUsername(url: string): string | null {
  if (!url || url.trim() === "") return null;

  const trimmedUrl = url.trim();

  // Handle @username format
  if (trimmedUrl.startsWith("@")) {
    return trimmedUrl.substring(1);
  }

  // Handle instagram.com/username format
  const usernameMatch = trimmedUrl.match(/instagram\.com\/([a-zA-Z0-9._]+)\/?/);
  if (usernameMatch) {
    return usernameMatch[1];
  }

  // If it's just a username without @ or URL
  if (/^[a-zA-Z0-9._]+$/.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return null;
}

export function InstagramBlock({ data }: InstagramBlockProps) {
  const username = data.username || getInstagramUsername(data.profileUrl || "");
  const profileUrl = username ? `https://instagram.com/${username}` : null;

  // If we have a valid username, show the link
  if (username && profileUrl) {
    return (
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.container}
      >
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <Instagram size={32} />
          </div>
          <div className={styles.info}>
            <span className={styles.username}>@{username}</span>
            <span className={styles.platform}>Instagram</span>
          </div>
          <span className={styles.arrow}>→</span>
        </div>
      </a>
    );
  }

  // Empty state
  return (
    <div className={styles.container}>
      <div className={styles.placeholder}>
        <Instagram size={32} className={styles.placeholderIcon} />
        <span className={styles.placeholderText}>Add Instagram Profile</span>
        <span className={styles.placeholderHint}>
          Add your Instagram username or profile URL
        </span>
      </div>
    </div>
  );
}
