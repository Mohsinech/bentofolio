"use client";

import { Music2 } from "lucide-react";
import styles from "./SpotifyBlock.module.css";
import { SpotifyContent } from "@/app/lib/types";

interface SpotifyBlockProps {
  data: SpotifyContent;
}

// Convert Spotify URL to embed URL
function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  // Already an embed URL
  if (url.includes("/embed/")) return url;

  // Parse Spotify URL patterns
  // https://open.spotify.com/track/xxx
  // https://open.spotify.com/playlist/xxx
  // https://open.spotify.com/album/xxx
  // https://open.spotify.com/artist/xxx
  const match = url.match(
    /spotify\.com\/(track|playlist|album|artist)\/([a-zA-Z0-9]+)/
  );
  if (match) {
    const [, type, id] = match;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }

  // Spotify URI format: spotify:track:xxx
  const uriMatch = url.match(
    /spotify:(track|playlist|album|artist):([a-zA-Z0-9]+)/
  );
  if (uriMatch) {
    const [, type, id] = uriMatch;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }

  return null;
}

export function SpotifyBlock({ data }: SpotifyBlockProps) {
  const embedUrl = data.spotifyUrl ? getEmbedUrl(data.spotifyUrl) : null;

  // If we have a Spotify URL, show the embed player
  if (embedUrl) {
    const isPlaylist =
      embedUrl.includes("/playlist/") || embedUrl.includes("/album/");
    return (
      <div className={styles.container}>
        <iframe
          src={embedUrl}
          className={isPlaylist ? styles.embedLarge : styles.embed}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify Player"
        />
      </div>
    );
  }

  // Fallback to manual display
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Music2 size={14} />
        <span>{data.type === "now-playing" ? "Now Playing" : "Top Track"}</span>
      </div>
      <div className={styles.content}>
        {data.albumArt ? (
          <img
            src={data.albumArt}
            alt={data.trackName}
            className={styles.albumArt}
          />
        ) : (
          <div className={styles.albumPlaceholder}>
            <Music2 size={24} color="#1db954" />
          </div>
        )}
        <div className={styles.trackInfo}>
          <span className={styles.trackName}>
            {data.trackName || "Not playing"}
          </span>
          <span className={styles.artistName}>{data.artistName || "..."}</span>
        </div>
        {data.type === "now-playing" && (
          <div className={styles.bars}>
            <div className={styles.bar} />
            <div className={styles.bar} />
            <div className={styles.bar} />
          </div>
        )}
      </div>
    </div>
  );
}
