"use client";

import { ArrowUpRight, ImagePlus, Images } from "lucide-react";
import NextImage from "next/image";
import { useState } from "react";
import { WorkContent } from "@/app/lib/types";
import styles from "./WorkBlock.module.css";

interface WorkBlockProps {
  data: WorkContent;
}

export function WorkBlock({ data }: WorkBlockProps) {
  const items = (data.items || []).filter((item) => item.image).slice(0, 3);
  const [activeIndex, setActiveIndex] = useState(0);
  const primary = items[activeIndex] || items[0];

  return (
    <div className={styles.container}>
      <div className={styles.stage}>
        {items.length > 0 ? (
          <div className={styles.envelopeStack}>
            {items.map((item, index) => (
              <NextImage
                key={`${item.title}-${index}`}
                src={item.image || ""}
                alt={item.title || "Work preview"}
                width={260}
                height={180}
                className={`${styles.previewImage} ${styles[`image${index}`] || ""} ${index === activeIndex ? styles.activeImage : ""}`}
                style={{ zIndex: index === activeIndex ? 19 : 10 + index }}
              />
            ))}
            <div className={styles.envelopeBack} />
            <div className={styles.envelopeFront}>
              <div className={styles.envelopeFold} />
              <div className={styles.envelopeMeta}>
                <span>{primary.year || "Today"}</span>
                <strong>
                  <Images size={16} />
                  {items.length}
                </strong>
              </div>
            </div>
            {items.length > 1 && (
              <div className={styles.switcher} aria-label="Switch work preview">
                {items.map((item, index) => (
                  <button
                    key={`${item.title}-switch-${index}`}
                    type="button"
                    className={index === activeIndex ? styles.switchActive : ""}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setActiveIndex(index);
                    }}
                    aria-label={`Show ${item.title || `project ${index + 1}`}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <ImagePlus size={28} />
            <span>Upload work images</span>
          </div>
        )}
      </div>

      <div className={styles.caption}>
        <div>
          <span>{data.subtitle || primary?.category || "Selected projects"}</span>
          <h3>{data.title || "Recent work"}</h3>
        </div>
        {primary?.url ? (
          <a
            href={primary.url}
            target="_blank"
            rel="noreferrer"
            className={styles.openButton}
            aria-label={`Open ${primary.title || "work"}`}
          >
            <ArrowUpRight size={16} />
          </a>
        ) : (
          <span className={styles.openButton}>
            <ArrowUpRight size={16} />
          </span>
        )}
      </div>
    </div>
  );
}
