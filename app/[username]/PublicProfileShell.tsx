"use client";

import { useMemo, useState } from "react";
import { Check, Download } from "lucide-react";
import type { BlockContent, BlockLayout, ThemeId } from "@/app/lib/types";
import { BentoGrid } from "@/app/components/bento/BentoGrid";
import { CvPrint, CvView, hasCvContent } from "@/app/components/bento/CvView";
import cvStyles from "@/app/components/bento/cv.module.css";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import { publicLayout, resolveLayout } from "@/app/components/bento/grid-layout";
import styles from "@/app/components/bento/bento.module.css";
import { ShareButton } from "./ShareButton";

interface PublicProfileShellProps {
  username: string;
  isPro: boolean;
  theme: ThemeId;
  avatarUrl?: string | null;
  layout: BlockLayout[];
  layoutVersion?: number | null;
  content: Record<string, BlockContent>;
  initialView?: "grid" | "cv";
  // Pro pages can turn the "Made with bentofolio" tag back on.
  showMadeWith?: boolean;
}

export function PublicProfileShell({
  username,
  isPro,
  theme,
  avatarUrl,
  layout,
  layoutVersion,
  content,
  initialView = "grid",
  showMadeWith = false,
}: PublicProfileShellProps) {
  const visible = useMemo(
    () => publicLayout(resolveLayout(layout, layoutVersion), content, isPro),
    [layout, layoutVersion, content, isPro]
  );

  const cvAvailable = useMemo(() => hasCvContent(visible, content), [visible, content]);
  const [view, setView] = useState<"grid" | "cv">(initialView);
  const showCv = cvAvailable && view === "cv";

  // ?view=cv makes the CV shareable (e.g. send it to a recruiter).
  function switchView(next: "grid" | "cv") {
    setView(next);
    const url = new URL(window.location.href);
    if (next === "cv") url.searchParams.set("view", "cv");
    else url.searchParams.delete("view");
    window.history.replaceState(null, "", url);
  }

  const identity = Object.values(content).find((block) => block?.type === "identity");
  const displayName =
    identity?.type === "identity" && identity.data.name?.trim() && identity.data.name.trim() !== "Your Name"
      ? identity.data.name.trim()
      : `@${username}`;

  // Pro pages offer the CV as a PDF: the browser's print dialog with the
  // print layout from cv.module.css ("Save as PDF").
  function downloadPdf() {
    const previous = document.title;
    document.title = `${displayName.replace(/^@/, "")} — CV`;
    const restore = () => {
      document.title = previous;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  }

  return (
    <main className={`${styles.theme} ${styles.page} ${bentoFontClasses}`} data-theme={theme}>
      <div className={styles.frame}>
        <header className={styles.header} data-print-hide>
          <span className={styles.brand}>
            {displayName}
            {isPro && (
              <span className={styles.verified} title="Verified" aria-label="Verified">
                <Check size={10} strokeWidth={3.2} aria-hidden="true" />
              </span>
            )}
          </span>
          {cvAvailable && (
            <div className={cvStyles.switch} role="group" aria-label="Profile view">
              <button type="button" aria-pressed={!showCv} onClick={() => switchView("grid")}>
                Grid
              </button>
              <button type="button" aria-pressed={showCv} onClick={() => switchView("cv")}>
                CV
              </button>
            </div>
          )}
          <div className={styles.headerActions}>
            {showCv && isPro && (
              <button type="button" className={cvStyles.pdfButton} onClick={downloadPdf}>
                <Download size={14} aria-hidden="true" />
                <span>PDF</span>
              </button>
            )}
            <ShareButton username={username} />
          </div>
        </header>

        {showCv ? (
          <>
            {/* Pro pages print the ATS-friendly CV instead of the web one. */}
            <div data-print-hide={isPro ? "" : undefined} data-block="cv">
              <CvView username={username} layout={visible} content={content} avatarUrl={avatarUrl} />
            </div>
            {isPro && <CvPrint username={username} layout={visible} content={content} />}
          </>
        ) : visible.length > 0 ? (
          <BentoGrid layout={visible} content={content} avatarUrl={avatarUrl} isPro={isPro} />
        ) : (
          <p className={styles.emptyPage}>This page is still being set up.</p>
        )}

        {(!isPro || showMadeWith) && (
          <footer className={styles.footer} data-print-hide>
            <a href="/" className={styles.madeWith} aria-label="Made with BentoFolio">
              <span className={styles.madeWithMark} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              Made with bentofolio
            </a>
          </footer>
        )}
      </div>
    </main>
  );
}
