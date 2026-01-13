"use client";

import { Play, Users, Eye, Video } from "lucide-react";
import { YouTubeContent } from "@/app/lib/types";
import styles from "./YouTubeBlock.module.css";

interface YouTubeBlockProps {
  data: YouTubeContent;
}

export function YouTubeBlock({ data }: YouTubeBlockProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={styles.youtubeIcon}
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <Users size={14} className={styles.statIcon} />
          <span className={styles.statValue}>{data.subscribers}</span>
          <span className={styles.statLabel}>Subscribers</span>
        </div>
        <div className={styles.stat}>
          <Eye size={14} className={styles.statIcon} />
          <span className={styles.statValue}>{data.views}</span>
          <span className={styles.statLabel}>Views</span>
        </div>
      </div>

      {data.latestVideoUrl && data.latestVideoTitle && (
        <a
          href={data.latestVideoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.video}
        >
          {data.thumbnailUrl ? (
            <div className={styles.thumbnail}>
              <img src={data.thumbnailUrl} alt={data.latestVideoTitle} />
              <div className={styles.playOverlay}>
                <Play size={24} fill="white" />
              </div>
            </div>
          ) : (
            <div className={styles.thumbnailPlaceholder}>
              <Video size={32} />
            </div>
          )}
          <p className={styles.videoTitle}>{data.latestVideoTitle}</p>
        </a>
      )}

      {data.description && (
        <p className={styles.description}>{data.description}</p>
      )}

      <a
        href={data.channelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.channelLink}
      >
        View Channel
      </a>
    </div>
  );
}
