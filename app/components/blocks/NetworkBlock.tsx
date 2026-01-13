"use client";

import { Pencil } from "lucide-react";
import { NetworkContent } from "@/app/lib/types";
import styles from "./NetworkBlock.module.css";

interface NetworkBlockProps {
  data: NetworkContent;
}

export function NetworkBlock({ data }: NetworkBlockProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{data.title || "Network"}</h3>
        <Pencil size={14} className={styles.editIcon} />
      </div>

      <div className={styles.avatars}>
        {data.connections.slice(0, 8).map((connection, index) => (
          <a
            key={index}
            href={connection.url || "#"}
            target={connection.url ? "_blank" : undefined}
            rel={connection.url ? "noopener noreferrer" : undefined}
            className={styles.avatarWrapper}
            style={{ zIndex: data.connections.length - index }}
            title={connection.name}
          >
            <img
              src={connection.avatar}
              alt={connection.name}
              className={styles.avatar}
            />
          </a>
        ))}
        {data.connections.length > 8 && (
          <div className={styles.more}>+{data.connections.length - 8}</div>
        )}
      </div>
    </div>
  );
}
