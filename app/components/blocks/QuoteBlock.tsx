"use client";

import { Quote } from "lucide-react";
import styles from "./QuoteBlock.module.css";
import { QuoteContent } from "@/app/lib/types";

interface QuoteBlockProps {
  data: QuoteContent;
}

export function QuoteBlock({ data }: QuoteBlockProps) {
  return (
    <div className={styles.container}>
      <Quote className={styles.quoteIcon} size={24} />

      <blockquote className={styles.quote}>{data.quote}</blockquote>

      <div className={styles.author}>
        {data.avatar && (
          <img src={data.avatar} alt={data.author} className={styles.avatar} />
        )}
        <div className={styles.authorInfo}>
          <span className={styles.authorName}>{data.author}</span>
          {(data.role || data.company) && (
            <span className={styles.authorRole}>
              {data.role}
              {data.role && data.company && " @ "}
              {data.company}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
