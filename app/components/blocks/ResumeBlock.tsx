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
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = data.fileUrl;
      link.download = data.title || "resume.pdf";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
        <span>{data.fileUrl ? "Download Resume" : "No Resume Yet"}</span>
      </button>
    </div>
  );
}
