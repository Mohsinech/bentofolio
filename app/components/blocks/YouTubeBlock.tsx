"use client";

import { Play } from "lucide-react";
import { YouTubeContent } from "@/app/lib/types";
import styles from "./YouTubeBlock.module.css";

function getEmbedUrl(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
}

export function YouTubeBlock({ data }: { data: YouTubeContent }) {
  const embedUrl = getEmbedUrl(data.url || "");

  return (
    <div className={styles.container}>
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={data.title || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={styles.iframe}
        />
      ) : (
        <div className={styles.empty}>
          <Play size={30} />
          <strong>{data.title || "YouTube"}</strong>
          <span>Paste a YouTube link</span>
        </div>
      )}
    </div>
  );
}
