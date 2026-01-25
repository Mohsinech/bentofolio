"use client";

import { Music2 } from "lucide-react";
import styles from "./SpotifyBlock.module.css";
import { SpotifyContent } from "@/app/lib/types";

interface SpotifyBlockProps {
  data: SpotifyContent;
}

// Convert any Spotify URL to embed URL
function getEmbedUrl(url: string): string | null {
  if (!url || url.trim() === "") return null;

  const trimmedUrl = url.trim();

  // Already an embed URL
  if (trimmedUrl.includes("/embed/")) return trimmedUrl;

  // Parse Spotify URL patterns
  // https://open.spotify.com/track/xxx
  // https://open.spotify.com/playlist/xxx
  // https://open.spotify.com/album/xxx
  // https://open.spotify.com/artist/xxx
  // https://open.spotify.com/show/xxx (podcasts)
  // https://open.spotify.com/episode/xxx
  const match = trimmedUrl.match(
    /spotify\.com\/(track|playlist|album|artist|show|episode)\/([a-zA-Z0-9]+)/,
  );
  if (match) {
    const [, type, id] = match;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }

  // Spotify URI format: spotify:track:xxx
  const uriMatch = trimmedUrl.match(
    /spotify:(track|playlist|album|artist|show|episode):([a-zA-Z0-9]+)/,
  );
  if (uriMatch) {
    const [, type, id] = uriMatch;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }

  // User profile URLs don't have embeds - show error
  if (trimmedUrl.includes("/user/")) {
    return null; // User profiles can't be embedded
  }

  return null;
}

export function SpotifyBlock({ data }: SpotifyBlockProps) {
  const embedUrl = data.spotifyUrl ? getEmbedUrl(data.spotifyUrl) : null;
  const hasInvalidUrl =
    data.spotifyUrl && data.spotifyUrl.trim() !== "" && !embedUrl;

  // If we have a valid Spotify URL, show the embed player
  if (embedUrl) {
    return (
      <div
        className={styles.container}
        style={{ fontFamily: "var(--font-mori), system-ui" }}
      >
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

  // Empty state or invalid URL - show placeholder with instructions
  return (
    <div
      className={styles.container}
      style={{ fontFamily: "var(--font-montreal), system-ui" }}
    >
      <div className={styles.placeholder}>
        <Music2 size={32} className={styles.placeholderIcon} />
        <span className={styles.placeholderText}>
          {hasInvalidUrl ? "Invalid Spotify URL" : "Add Spotify URL"}
        </span>
        <span className={styles.placeholderHint}>
          {hasInvalidUrl
            ? "Use a track, playlist, or album link"
            : "Paste a track, playlist, or album link"}
        </span>
      </div>
    </div>
  );
}
