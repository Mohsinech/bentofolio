"use client";

import { ArrowUpRight, BookOpen, FileText, Sparkle } from "lucide-react";
import { CreativeContent } from "@/app/lib/types";
import styles from "./CreativeBlock.module.css";

interface CreativeBlockProps {
  data: CreativeContent;
}

export function CreativeBlock({ data }: CreativeBlockProps) {
  const items = data.items || [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>
            <Sparkle size={12} />
            Creative Desk
          </span>
          <h3 className={styles.title}>{data.title || "Creative workspace"}</h3>
        </div>
        {data.notionUrl && (
          <a
            className={styles.notionButton}
            href={data.notionUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Notion page"
          >
            <BookOpen size={15} />
          </a>
        )}
      </div>

      <p className={styles.description}>
        {data.description ||
          "Share your process, references, notes, and creative work in one calm space."}
      </p>

      <div className={styles.doc}>
        <div className={styles.docTop}>
          <span />
          <span />
          <span />
        </div>
        <div className={styles.docBody}>
          {items.length > 0 ? (
            items.slice(0, 4).map((item, index) => {
              const content = (
                <>
                  <span className={styles.itemIcon}>
                    <FileText size={13} />
                  </span>
                  <span className={styles.itemMain}>
                    <strong>{item.title || "Untitled page"}</strong>
                    <small>{item.type || "Note"}</small>
                  </span>
                  {item.status && (
                    <span className={styles.status}>{item.status}</span>
                  )}
                  {item.url && <ArrowUpRight size={13} />}
                </>
              );

              return item.url ? (
                <a
                  key={`${item.title}-${index}`}
                  className={styles.item}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {content}
                </a>
              ) : (
                <div key={`${item.title}-${index}`} className={styles.item}>
                  {content}
                </div>
              );
            })
          ) : (
            <div className={styles.empty}>Add a project, note, or case study.</div>
          )}
        </div>
      </div>

      {(data.ctaLabel || data.ctaUrl) && (
        <a
          className={styles.cta}
          href={data.ctaUrl || data.notionUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {data.ctaLabel || "Explore workspace"}
          <ArrowUpRight size={14} />
        </a>
      )}
    </div>
  );
}
