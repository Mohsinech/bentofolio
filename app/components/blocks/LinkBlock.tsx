"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpLeft, Check, Copy } from "lucide-react";
import styles from "./LinkBlock.module.css";
import { LinkContent } from "@/app/lib/types";

interface LinkBlockProps {
  data: LinkContent;
}

function getEmail(url: string) {
  if (!url) return "";
  if (url.startsWith("mailto:")) return url.replace("mailto:", "");
  return url.includes("@") && !url.startsWith("http") ? url : "";
}

function getHref(url: string) {
  if (!url) return "";
  if (url.startsWith("mailto:") || url.startsWith("http")) return url;
  if (url.includes("@")) return `mailto:${url}`;
  return `https://${url}`;
}

export function LinkBlock({ data }: LinkBlockProps) {
  const [copied, setCopied] = useState(false);
  const email = getEmail(data.url);
  const href = getHref(data.url);
  const heading = data.title || "Let's Collaborate";

  const handleCopy = async (event: React.MouseEvent) => {
    if (!email) return;
    event.preventDefault();
    await navigator.clipboard.writeText(email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  if (!href && !heading) {
    return (
      <div className={`${styles.container} ${styles.empty}`}>
        <span>Add a collaboration link...</span>
      </div>
    );
  }

  return (
    <motion.a
      href={href || "#"}
      target={email ? undefined : "_blank"}
      rel={email ? undefined : "noopener noreferrer"}
      className={styles.container}
      onClick={email ? handleCopy : undefined}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={styles.headingRow}>
        <h3>{heading}</h3>
        <span className={styles.arrow}>
          {copied ? <Check size={18} /> : <ArrowUpLeft size={18} />}
        </span>
      </div>

      <div className={styles.copyText}>
        {email ? (
          <>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "email copied" : "copy email"}</span>
          </>
        ) : (
          <>
            <ArrowUpLeft size={14} />
            <span>open link</span>
          </>
        )}
      </div>
    </motion.a>
  );
}
