"use client";

import { Youtube } from "lucide-react";
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

  // YouTube video patterns:
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/v/VIDEO_ID
  // https://www.youtube.com/shorts/VIDEO_ID

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
  const hasInvalidUrl =
    data.videoUrl && data.videoUrl.trim() !== "" && !embedUrl;

  // If we have a valid YouTube URL, show the embed player
  if (embedUrl) {
    return (
      <div className={styles.container}>
        <iframe
          src={embedUrl}
          className={styles.embed}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title="YouTube Video"
        />
      </div>
    );
  }

  // Empty state or invalid URL
  return (
    <div className={styles.container}>
      <div className={styles.placeholder}>
        <Youtube size={32} className={styles.placeholderIcon} />
        <span className={styles.placeholderText}>
          {hasInvalidUrl ? "Invalid YouTube URL" : "Add YouTube URL"}
        </span>
        <span className={styles.placeholderHint}>
          {hasInvalidUrl
            ? "Use a video or playlist link"
            : "Paste a video or playlist link"}
        </span>
      </div>
    </div>
  );
}
