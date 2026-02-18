"use client";

import { Instagram } from "lucide-react";
import { InstagramContent } from "@/app/lib/types";
import styles from "./InstagramBlock.module.css";

interface InstagramBlockProps {
  data: InstagramContent & {
    postUrl?: string;
  };
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
  const postUrl = data.postUrl;

  if (username && postUrl) {
    return (
      <div className={styles.container}>
        {/* Instagram Embed */}
        <div className={styles.embedWrapper}>
          <iframe
            src={`https://www.instagram.com/p/${getInstagramPostId(postUrl)}/embed`}
            width="1000"
            height="1000"
            frameBorder="0"
            scrolling="no"
            allow="encrypted-media"
            title="Instagram Post"
            style={{
              border: 0,
              width: "100%",
              height: "100%",
            }}
          ></iframe>
        </div>
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <Instagram size={20} />
          </div>
          <div className={styles.info}>
            <span className={styles.username}>@{username}</span>
            <span className={styles.platform}>Instagram</span>
          </div>
          <a
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.postLink}
          >
            View Post
          </a>
        </div>
      </div>
    );
  }

  // Empty state
  return (
    <div className={styles.container}>
      <div className={styles.placeholder}>
        <Instagram size={32} className={styles.placeholderIcon} />
        <span className={styles.placeholderText}>Add Instagram Post</span>
        <span className={styles.placeholderHint}>
          Add your Instagram username and post URL
        </span>
      </div>
    </div>
  );
}

// Helper to extract post ID from Instagram post URL
function getInstagramPostId(url: string): string | null {
  if (!url) return null;
  // Match /p/{shortcode}/
  const match = url.match(/instagram\.com\/p\/([\w-]+)/);
  if (match) return match[1];
  // Also support just the shortcode
  if (/^[\w-]+$/.test(url)) return url;
  return null;
}
