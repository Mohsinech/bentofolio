"use client";

import NextImage from "next/image";
import { Images } from "lucide-react";
import { GalleryContent } from "@/app/lib/types";
import styles from "./GalleryBlock.module.css";

export function GalleryBlock({ data }: { data: GalleryContent }) {
  const images = (data.images || []).filter((image) => image.src).slice(0, 4);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Images size={15} />
        <span>{data.title || "Gallery"}</span>
      </div>
      {images.length > 0 ? (
        <div className={styles.grid}>
          {images.map((image, index) => (
            <NextImage
              key={`${image.src}-${index}`}
              src={image.src}
              alt={image.alt || "Gallery image"}
              width={220}
              height={180}
              className={styles.image}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <Images size={26} />
          <span>Add favorite images</span>
        </div>
      )}
    </div>
  );
}
