"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import NextImage from "next/image";
import styles from "./ExperienceBlock.module.css";
import { ExperienceContent } from "@/app/lib/types";
import {
  getCompanyLogo,
  getCompanyInitials,
  getCompanyColor,
} from "@/app/lib/company-logos";

interface ExperienceBlockProps {
  data: ExperienceContent;
}

function CompanyLogo({ company, logo }: { company: string; logo?: string }) {
  const [imgError, setImgError] = useState(false);
  const detectedLogo = getCompanyLogo(company);
  const savedLogo =
    logo && !logo.includes("logo.clearbit.com") ? logo : detectedLogo;
  const logoUrl = savedLogo || detectedLogo;
  const initials = getCompanyInitials(company);
  const bgColor = getCompanyColor(company);

  if (imgError || !logoUrl) {
    return (
      <div className={styles.logoFallback} style={{ backgroundColor: bgColor }}>
        {initials}
      </div>
    );
  }

  return (
    <NextImage
      src={logoUrl}
      alt={company}
      width={40}
      height={40}
      className={styles.logo}
      onError={() => setImgError(true)}
    />
  );
}

export function ExperienceBlock({ data }: ExperienceBlockProps) {
  // Fallback if no items
  if (!data.items || data.items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Briefcase size={14} />
          <span>Experience</span>
        </div>
        <div className={styles.empty}>
          <Briefcase size={24} />
          <span>Add your work experience</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Briefcase size={14} />
        <span>Experience</span>
      </div>
      <div className={styles.list}>
        {data.items.map((item, index) => (
          <motion.div
            key={`${item.company}-${item.period}-${index}`}
            className={styles.item}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CompanyLogo company={item.company} logo={item.logo} />
            <div className={styles.info}>
              <span className={styles.company}>
                {item.company || "Company"}
              </span>
              <span className={styles.role}>{item.role || "Role"}</span>
              <span className={styles.period}>{item.period || "Period"}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
