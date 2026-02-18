"use client";

import { Users, Linkedin } from "lucide-react";
import { NetworkContent } from "@/app/lib/types";
import styles from "./NetworkBlock.module.css";

interface NetworkBlockProps {
  data: NetworkContent;
}

export function NetworkBlock({ data }: NetworkBlockProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Users size={16} />
        <h3 className={styles.title}>{data.title || "Network"}</h3>
      </div>

      <div className={styles.avatars}>
        {data.connections.slice(0, 8).map((connection, index) => (
          <a
            key={index}
            href={connection.linkedinUrl || connection.url || "#"}
            target={
              connection.linkedinUrl || connection.url ? "_blank" : undefined
            }
            rel={
              connection.linkedinUrl || connection.url
                ? "noopener noreferrer"
                : undefined
            }
            className={styles.avatarWrapper}
            style={{ zIndex: data.connections.length - index }}
            title={connection.name}
          >
            {connection.avatar ? (
              <img
                src={connection.avatar}
                alt={connection.name}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {connection.name.charAt(0).toUpperCase()}
              </div>
            )}
            {connection.linkedinUrl && (
              <div className={styles.linkedinBadge}>
                <Linkedin size={10} />
              </div>
            )}
          </a>
        ))}
        {data.connections.length > 8 && (
          <div className={styles.more}>+{data.connections.length - 8}</div>
        )}
      </div>
    </div>
  );
}
