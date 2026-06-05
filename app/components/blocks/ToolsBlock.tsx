"use client";

import { Boxes } from "lucide-react";
import NextImage from "next/image";
import { ToolsContent } from "@/app/lib/types";
import { getTechIconUrl } from "@/app/lib/tech-icons";
import styles from "./ToolsBlock.module.css";

function isLocalImageIcon(value?: string) {
  const icon = value?.trim();
  return Boolean(icon && icon.startsWith("/"));
}

function getToolLogo(item: ToolsContent["items"][number]) {
  const customIcon = item.icon?.trim();
  if (isLocalImageIcon(customIcon)) return customIcon;
  return getTechIconUrl(item.name.trim());
}

function getFallbackIcon(item: ToolsContent["items"][number]) {
  const customIcon = item.icon?.trim();
  if (customIcon && !isLocalImageIcon(customIcon)) return customIcon.slice(0, 2);
  return item.name.trim().slice(0, 2) || "-";
}

export function ToolsBlock({ data }: { data: ToolsContent }) {
  const items = (data.items || []).slice(0, 6);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Boxes size={15} />
        <span>{data.title || "Tools I use"}</span>
      </div>
      <div className={styles.tools}>
        {items.map((item, index) => {
          const logo = getToolLogo(item);

          return (
            <div key={`${item.name}-${index}`} className={styles.tool}>
              <strong>
                {logo ? (
                  <NextImage
                    className={styles.toolLogo}
                    src={logo}
                    alt=""
                    width={24}
                    height={24}
                  />
                ) : (
                  getFallbackIcon(item)
                )}
              </strong>
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
