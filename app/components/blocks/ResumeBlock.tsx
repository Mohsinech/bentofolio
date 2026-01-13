"use client";

import { FileText, Download, Calendar } from "lucide-react";
import styles from "./ResumeBlock.module.css";
import { ResumeContent } from "@/app/lib/types";

interface ResumeBlockProps {
  data: ResumeContent;
}

export function ResumeBlock({ data }: ResumeBlockProps) {
  const handleDownload = () => {
    if (data.fileUrl) {
      window.open(data.fileUrl, "_blank");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <FileText size={32} />
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{data.title || "My Resume"}</h3>
        {data.lastUpdated && (
          <div className={styles.updated}>
            <Calendar size={12} />
            <span>Updated {data.lastUpdated}</span>
          </div>
        )}
      </div>

      <button
        className={styles.downloadButton}
        onClick={handleDownload}
        disabled={!data.fileUrl}
      >
        <Download size={16} />
        <span>Download</span>
      </button>
    </div>
  );
}
