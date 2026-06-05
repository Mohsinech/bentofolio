"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import {
  LogOut,
  Search,
  WalletCards,
} from "lucide-react";

import { BlockContent, BlockLayout } from "@/app/lib/types";
import { PublicGrid } from "./PublicGrid";
import styles from "./profile.module.css";

interface PublicProfileShellProps {
  username: string;
  isPro: boolean;
  layout: BlockLayout[];
  content: Record<string, BlockContent>;
}

export function PublicProfileShell({
  username,
  isPro,
  layout,
  content,
}: PublicProfileShellProps) {
  const [query, setQuery] = useState("");

  const identity = useMemo(
    () => Object.values(content).find((block) => block.type === "identity"),
    [content]
  );

  const displayName =
    identity?.type === "identity" ? identity.data.name : username;
  const title =
    identity?.type === "identity" ? identity.data.title : "Portfolio";
  const avatar =
    identity?.type === "identity" ? identity.data.avatar : "";
  const visibleLayout = layout.filter((block) => {
    const blockContent = content[block.id];
    if (!blockContent) return false;
    return `${block.type} ${JSON.stringify(blockContent.data)}`
      .toLowerCase()
      .includes(query.toLowerCase());
  });

  return (
    <div className={styles.shellPage}>
      <div className={styles.publicShell}>
        <aside className={styles.publicSidebar}>
          {avatar ? (
            <NextImage
              src={avatar}
              alt={displayName}
              width={34}
              height={34}
              className={styles.publicAppImage}
            />
          ) : (
            <div className={styles.publicAppIcon}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <nav>
            <Link href={`/${username}`} className={styles.publicNavActive}>
              <WalletCards size={13} />
              Portfolio
            </Link>
          </nav>
          <div className={styles.publicSidebarBottom}>
            <Link href="/">
              <LogOut size={13} />
              BentoFolio
            </Link>
          </div>
        </aside>

        <main className={styles.publicMain}>
          <div className={styles.publicTopbar}>
            <div className={styles.crumbs}>
              <Link href="/">BentoFolio</Link>
              <span>/</span>
              <Link href={`/${username}`}>{displayName}</Link>
            </div>
            <label className={styles.publicSearch}>
              <Search size={13} />
              <input
                placeholder="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className={styles.publicUser}>
              <span>{displayName}</span>
            </div>
          </div>

          <header className={styles.publicIntro}>
            <div>
              <span className={styles.publicEyebrow}>Portfolio</span>
              <h1>{displayName}</h1>
              <p>{title}</p>
            </div>
            {avatar && (
              <NextImage
                src={avatar}
                alt={displayName}
                width={72}
                height={72}
                className={styles.publicIntroAvatar}
              />
            )}
          </header>

          <section className={styles.publicPortfolioPanel}>
            {visibleLayout.length > 0 ? (
              <PublicGrid layout={visibleLayout} content={content} isPro={isPro} />
            ) : (
              <div className={styles.publicEmpty}>
                No portfolio cards match this search.
              </div>
            )}
          </section>
        </main>

      </div>
    </div>
  );
}
