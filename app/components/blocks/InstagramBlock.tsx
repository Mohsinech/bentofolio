"use client";

import { Instagram } from "lucide-react";
import { InstagramContent } from "@/app/lib/types";
import styles from "./InstagramBlock.module.css";

interface InstagramBlockProps {
  data: InstagramContent;
}

// Convert Instagram URL to embed URL
function getEmbedUrl(url: string): string | null {
  if (!url || url.trim() === "") return null;

  const trimmedUrl = url.trim();

  // Instagram post/reel patterns:
  // https://www.instagram.com/p/POST_ID/
  // https://www.instagram.com/reel/REEL_ID/

  const postMatch = trimmedUrl.match(
    /instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/
  );
  if (postMatch) {
    return `https://www.instagram.com/${postMatch[1]}/${postMatch[2]}/embed`;
  }

  return null;
}

export function InstagramBlock({ data }: InstagramBlockProps) {
  const embedUrl = data.postUrl ? getEmbedUrl(data.postUrl) : null;
  const hasInvalidUrl = data.postUrl && data.postUrl.trim() !== "" && !embedUrl;

  // If we have a valid Instagram URL, show the embed
  if (embedUrl) {
    return (
      <div className={styles.container}>
        <iframe
          src={embedUrl}
          className={styles.embed}
          allowTransparency
          scrolling="no"
          loading="lazy"
          title="Instagram Post"
        />
      </div>
    );
  }

  // Empty state or invalid URL
  return (
    <div className={styles.container}>
      <div className={styles.placeholder}>
        <Instagram size={32} className={styles.placeholderIcon} />
        <span className={styles.placeholderText}>
          {hasInvalidUrl ? "Invalid Instagram URL" : "Add Instagram URL"}
        </span>
        <span className={styles.placeholderHint}>
          {hasInvalidUrl
            ? "Use a post or reel link"
            : "Paste a post or reel link"}
        </span>
      </div>
    </div>
  );
}
