"use client";

import { useState } from "react";
import {
  Share2,
  Check,
  Link as LinkIcon,
  Twitter,
  Linkedin,
} from "lucide-react";
import styles from "./profile.module.css";

interface ShareButtonProps {
  username: string;
}

export function ShareButton({ username }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileUrl = `https://bentofolio.dev/${username}`;
  const shareText = `Check out my portfolio on BentoFolio!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1500);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = profileUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1500);
    }
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(profileUrl)}`;
    window.open(url, "_blank", "width=550,height=420");
    setShowMenu(false);
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      profileUrl
    )}`;
    window.open(url, "_blank", "width=550,height=420");
    setShowMenu(false);
  };

  const handleNativeShare = async () => {
    const canNativeShare =
      typeof navigator !== "undefined" && typeof navigator.share === "function";

    if (canNativeShare) {
      try {
        await navigator.share({
          title: `${username}'s Portfolio`,
          text: shareText,
          url: profileUrl,
        });
      } catch {
        // User cancelled or error
      }
      setShowMenu(false);
    }
  };

  const handleButtonClick = () => {
    const canNativeShare =
      typeof navigator !== "undefined" && typeof navigator.share === "function";

    if (canNativeShare) {
      handleNativeShare();
    } else {
      setShowMenu(!showMenu);
    }
  };

  return (
    <div className={styles.shareContainer}>
      <button
        className={styles.shareButton}
        onClick={handleButtonClick}
        aria-label="Share profile"
      >
        <Share2 size={18} />
        <span>Share</span>
      </button>

      {showMenu && (
        <>
          <div
            className={styles.shareOverlay}
            onClick={() => setShowMenu(false)}
          />
          <div className={styles.shareMenu}>
            <button className={styles.shareMenuItem} onClick={handleCopyLink}>
              {copied ? <Check size={16} /> : <LinkIcon size={16} />}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
            <button
              className={styles.shareMenuItem}
              onClick={handleShareTwitter}
            >
              <Twitter size={16} />
              <span>Twitter</span>
            </button>
            <button
              className={styles.shareMenuItem}
              onClick={handleShareLinkedIn}
            >
              <Linkedin size={16} />
              <span>LinkedIn</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
