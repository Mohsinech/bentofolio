"use client";

import { Music2 } from "lucide-react";
import styles from "./SpotifyBlock.module.css";
import { SpotifyContent } from "@/app/lib/types";

interface SpotifyBlockProps {
  data: SpotifyContent;
}

// Convert any Spotify URL to embed URL
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

  // If we have a valid Spotify URL, show the embed player
  if (embedUrl) {
    return (
      <div className={styles.container}>
        <iframe
          src={embedUrl}
          className={styles.embed}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify Player"
        />
      </div>
    );
  }

  // Empty state - show placeholder with instructions
  return (
    <div className={styles.container}>
      <div className={styles.placeholder}>
        <Music2 size={32} className={styles.placeholderIcon} />
        <span className={styles.placeholderText}>Add Spotify URL</span>
        <span className={styles.placeholderHint}>
          Paste a track, playlist, or album link
        </span>
      </div>
    </div>
  );
}
