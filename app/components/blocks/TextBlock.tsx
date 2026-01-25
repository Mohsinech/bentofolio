"use client";

import styles from "./TextBlock.module.css";

interface TextBlockProps {
  data: {
    text: string;
  };
}

export function TextBlock({ data }: TextBlockProps) {
  if (!data.text) {
    return (
      <div className={styles.container}>
        <p className={styles.empty}>Add your text content...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <p
        className={styles.text}
        style={{ fontFamily: "var(--font-mori), system-ui" }}
      >
        {data.text}
      </p>
    </div>
  );
}
