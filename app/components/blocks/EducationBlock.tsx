"use client";

import NextImage from "next/image";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { EducationContent } from "@/app/lib/types";
import styles from "./EducationBlock.module.css";

interface EducationBlockProps {
  data: EducationContent;
}

export function EducationBlock({ data }: EducationBlockProps) {
  const items = data.items || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <GraduationCap size={15} />
        <span>{data.title || "Education"}</span>
      </div>

      {items.length > 0 ? (
        <div className={styles.list}>
          {items.slice(0, 3).map((item, index) => (
            <motion.div
              key={`${item.school}-${index}`}
              className={styles.item}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              {item.logo ? (
                <NextImage
                  src={item.logo}
                  alt={item.school}
                  width={40}
                  height={40}
                  className={styles.logo}
                />
              ) : (
                <div className={styles.logoFallback}>
                  {item.school?.charAt(0).toUpperCase() || "E"}
                </div>
              )}
              <div className={styles.copy}>
                <strong>{item.school || "School"}</strong>
                <span>{item.degree || "Degree / Program"}</span>
                <small>{item.period || "Year"}</small>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <GraduationCap size={28} />
          <span>Add education</span>
        </div>
      )}
    </div>
  );
}
