"use client";

import { useState, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface ExportOptions {
  filename?: string;
  quality?: number;
  scale?: number;
}

export function useExportPDF() {
  const [exporting, setExporting] = useState(false);

  const exportToPDF = useCallback(
    async (
      elementId: string,
      options: ExportOptions = {}
    ): Promise<boolean> => {
      const { filename = "portfolio", quality = 0.95, scale = 2 } = options;

      setExporting(true);

      try {
        const element = document.getElementById(elementId);
        if (!element) {
          throw new Error(`Element with id "${elementId}" not found`);
        }

        // Get computed background color from CSS variables
        const computedStyle = getComputedStyle(document.documentElement);
        const bgColor =
          computedStyle.getPropertyValue("--bg-primary").trim() || "#09090b";

        // Get the element's dimensions
        const rect = element.getBoundingClientRect();

        // Create canvas from the element
        const canvas = await html2canvas(element, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: bgColor,
          logging: false,
          width: rect.width,
          height: rect.height,
          windowWidth: rect.width,
          windowHeight: rect.height,
        });

        // Calculate PDF dimensions (A4 or fit to content)
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Use landscape if wider than tall
        const isLandscape = imgWidth > imgHeight;
        const orientation = isLandscape ? "landscape" : "portrait";

        // Calculate dimensions to fit on page
        const pdfWidth = isLandscape ? 297 : 210; // A4 in mm
        const pdfHeight = isLandscape ? 210 : 297;

        // Scale to fit
        const ratio = Math.min(
          pdfWidth / (imgWidth / scale),
          pdfHeight / (imgHeight / scale)
        );

        const finalWidth = (imgWidth / scale) * ratio;
        const finalHeight = (imgHeight / scale) * ratio;

        // Center on page
        const xOffset = (pdfWidth - finalWidth) / 2;
        const yOffset = (pdfHeight - finalHeight) / 2;

        // Create PDF
        const pdf = new jsPDF({
          orientation,
          unit: "mm",
          format: "a4",
        });

        // Fill background with theme color
        pdf.setFillColor(bgColor);
        pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

        // Add the image
        const imgData = canvas.toDataURL("image/png", quality);
        pdf.addImage(imgData, "PNG", xOffset, yOffset, finalWidth, finalHeight);

        // Save the PDF
        pdf.save(`${filename}.pdf`);

        return true;
      } catch (error) {
        console.error("PDF export failed:", error);
        return false;
      } finally {
        setExporting(false);
      }
    },
    []
  );

  return { exportToPDF, exporting };
}
