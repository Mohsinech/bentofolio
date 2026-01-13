"use client";

import { Download, Loader2 } from "lucide-react";
import { useExportPDF } from "@/app/lib/hooks";
import styles from "./profile.module.css";

interface ExportButtonProps {
  username: string;
}

export function ExportButton({ username }: ExportButtonProps) {
  const { exportToPDF, exporting } = useExportPDF();

  const handleExport = async () => {
    const success = await exportToPDF("public-portfolio-grid", {
      filename: `${username}-portfolio`,
      quality: 0.95,
      scale: 2,
    });
    if (!success) {
      alert("Failed to export PDF. Please try again.");
    }
  };

  return (
    <button
      className={styles.exportButton}
      onClick={handleExport}
      disabled={exporting}
      title="Download as PDF"
    >
      {exporting ? (
        <Loader2 size={16} className={styles.spinning} />
      ) : (
        <Download size={16} />
      )}
    </button>
  );
}
