"use client";

import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import styles from "./TechStackBlock.module.css";
import { TechStackContent } from "@/app/lib/types";
import { getTechIconUrl } from "@/app/lib/tech-icons";

interface TechStackBlockProps {
  data: TechStackContent;
}

// Tech item component with SVG icon support
function TechItem({
  name,
  icon,
  index,
}: {
  name: string;
  icon: string;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const iconUrl = getTechIconUrl(name);

  return (
    <motion.div
      className={styles.tech}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className={styles.techIcon}>
        {iconUrl && !imgError ? (
          <Image
            src={iconUrl}
            alt={name}
            width={18}
            height={18}
            className={styles.techSvg}
            onError={() => setImgError(true)}
          />
        ) : (
          icon
        )}
      </span>
      <span>{name}</span>
    </motion.div>
  );
}

export function TechStackBlock({ data }: TechStackBlockProps) {
  // Empty state
  if (!data.items || data.items.length === 0) {
    return (
      <div
        className={styles.wrapper}
        style={{ fontFamily: "var(--font-montreal), system-ui" }}
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <Code2 size={14} />
            <span>Tech Stack</span>
          </div>
          <div className={styles.empty}>
            <span>Add your technologies...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.wrapper}
      style={{ fontFamily: "var(--font-mori), system-ui" }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <Code2 size={14} />
          <span>Tech Stack</span>
        </div>
        <div className={styles.grid}>
          {data.items.map((tech, index) => (
            <TechItem
              key={tech.name}
              name={tech.name}
              icon={tech.icon}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
