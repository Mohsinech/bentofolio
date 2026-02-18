"use client";

import { motion } from "framer-motion";
import {
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Instagram,
  Dribbble,
  Globe,
  Mail,
} from "lucide-react";
import styles from "./SocialBlock.module.css";
import { SocialContent } from "@/app/lib/types";

interface SocialBlockProps {
  data: SocialContent;
}

const platformIcons: Record<string, React.ReactNode> = {
  twitter: <Twitter size={18} />,
  linkedin: <Linkedin size={18} />,
  github: <Github size={18} />,
  youtube: <Youtube size={18} />,
  instagram: <Instagram size={18} />,
  dribbble: <Dribbble size={18} />,
  behance: <span className={styles.behanceIcon}>Bē</span>,
  website: <Globe size={18} />,
  email: <Mail size={18} />,
};

const platformColors: Record<string, string> = {
  twitter: "#1DA1F2",
  linkedin: "#0A66C2",
  github: "currentColor",
  youtube: "#FF0000",
  instagram: "#E4405F",
  dribbble: "#EA4C89",
  behance: "#1769FF",
  website: "#a855f7",
  email: "#22c55e",
};

export function SocialBlock({ data }: SocialBlockProps) {
  const { items } = data;

  return (
    <div className={styles.wrapper}>
      <div className={styles.links}>
        {items.map((item, i) => (
          <motion.a
            key={`${item.platform}-${i}`}
            href={item.platform === "email" ? `mailto:${item.url}` : item.url}
            target={item.platform === "email" ? undefined : "_blank"}
            rel="noopener noreferrer"
            className={styles.link}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={
              {
                "--platform-color": platformColors[item.platform],
              } as React.CSSProperties
            }
          >
            <span className={styles.icon}>{platformIcons[item.platform]}</span>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
