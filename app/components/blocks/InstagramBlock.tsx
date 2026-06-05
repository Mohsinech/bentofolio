"use client";

import NextImage from "next/image";
import { ExternalLink, Heart, Instagram, Users } from "lucide-react";
import { InstagramContent } from "@/app/lib/types";
import styles from "./InstagramBlock.module.css";

function normalizeInstagramUrl(handle: string, profileUrl: string) {
  if (profileUrl) {
    return profileUrl.startsWith("http") ? profileUrl : `https://${profileUrl}`;
  }
  const cleanHandle = handle.replace(/^@/, "");
  return cleanHandle ? `https://instagram.com/${cleanHandle}` : "";
}

export function InstagramBlock({ data }: { data: InstagramContent }) {
  const handle = data.handle || "@yourhandle";
  const profileUrl = normalizeInstagramUrl(handle, data.profileUrl || "");
  const href = data.featuredPostUrl || profileUrl || undefined;

  return (
    <a
      className={styles.container}
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noreferrer" : undefined}
    >
      <div className={styles.header}>
        <span className={styles.icon}>
          <Instagram size={18} />
        </span>
        <div>
          <strong>{handle.startsWith("@") ? handle : `@${handle}`}</strong>
          <small>Instagram</small>
        </div>
        {href && <ExternalLink size={14} className={styles.external} />}
      </div>

      <div className={styles.media}>
        {data.image ? (
          <NextImage
            src={data.image}
            alt={handle}
            width={180}
            height={180}
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>
            <Instagram size={34} />
          </div>
        )}
      </div>

      <div className={styles.metrics}>
        <span>
          <Users size={13} />
          <strong>{data.followers || "12.4k"}</strong>
          followers
        </span>
        <span>
          <Instagram size={13} />
          <strong>{data.posts || "186"}</strong>
          posts
        </span>
        <span>
          <Heart size={13} />
          <strong>{data.engagement || "8.7%"}</strong>
          engagement
        </span>
      </div>
    </a>
  );
}
