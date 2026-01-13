"use client";

import { Youtube, Users } from "lucide-react";
import { YouTubeContent } from "@/app/lib/types";
import styles from "./YouTubeBlock.module.css";

interface YouTubeBlockProps {
  data: YouTubeContent;
}

// Convert YouTube URL to embed URL
function getEmbedUrl(url: string): string | null {
  if (!url || url.trim() === "") return null;

  const trimmedUrl = url.trim();

  // Already an embed URL
  if (trimmedUrl.includes("/embed/")) return trimmedUrl;

  // Standard watch URL
  const watchMatch = trimmedUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // Short URL (youtu.be)
  const shortMatch = trimmedUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  // Shorts URL
  const shortsMatch = trimmedUrl.match(
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  );
  if (shortsMatch) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // Playlist
  const playlistMatch = trimmedUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (playlistMatch) {
    return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`;
  }

  return null;
}

export function YouTubeBlock({ data }: YouTubeBlockProps) {
  const embedUrl = data.videoUrl ? getEmbedUrl(data.videoUrl) : null;

  return (
    <div className={styles.container}>
      {/* Header with channel info */}
      <div className={styles.header}>
        <div className={styles.channelInfo}>
          <div className={styles.icon}>
            <Youtube size={18} />
          </div>
          <div className={styles.details}>
            <span className={styles.channelName}>
              {data.channelName || "Channel Name"}
            </span>
            <div className={styles.stats}>
              <Users size={12} />
              <span>{data.subscribers || "0"} subscribers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video embed or placeholder */}
      {embedUrl ? (
        <div className={styles.videoWrapper}>
          <iframe
            src={embedUrl}
            className={styles.embed}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title="YouTube Video"
          />
        </div>
      ) : (
        <div className={styles.placeholder}>
          <Youtube size={24} className={styles.placeholderIcon} />
          <span className={styles.placeholderText}>Add video URL</span>
        </div>
      )}
    </div>
  );
}
