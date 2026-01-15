"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, Users, ExternalLink, Sparkles } from "lucide-react";
import styles from "./discover.module.css";

interface PublicProfile {
  username: string;
  name: string;
  title: string;
  avatar: string;
  theme: string;
  isPro: boolean;
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const res = await fetch("/api/discover");
        if (res.ok) {
          const data = await res.json();
          setProfiles(data.profiles || []);
        }
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <div className={styles.container} style={{ fontFamily: 'var(--font-mori), sans-serif' }}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back
        </Link>
        <div className={styles.headerContent}>
            <h1 className={styles.title} style={{ fontFamily: 'var(--font-montreal), sans-serif' }}>
              <Users size={32} />
              Discover
            </h1>
          <p className={styles.subtitle}>
            Browse portfolios from our community
          </p>
        </div>
      </header>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <Search size={20} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by name, username, or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Profiles Grid */}
      <main className={styles.main}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading portfolios...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className={styles.empty}>
            <Users size={48} />
            <h2>No portfolios found</h2>
            <p>Be the first to create one!</p>
            <Link href="/auth/signup" className={styles.ctaButton}>
              Create Your Portfolio
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredProfiles.map((profile, i) => (
              <motion.div
                key={profile.username}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/${profile.username}`}
                  className={styles.profileCard}
                >
                  <div className={styles.cardHeader}>
                    {profile.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt={profile.name}
                        className={styles.avatar}
                        width={48}
                        height={48}
                        unoptimized
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {profile.name.charAt(0)}
                      </div>
                    )}
                    {profile.isPro && (
                      <span className={styles.proBadge}>
                        <Sparkles size={10} />
                        Pro
                      </span>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.profileName}>{profile.name}</h3>
                    <p className={styles.profileTitle}>{profile.title}</p>
                    <span className={styles.profileUsername}>
                      @{profile.username}
                    </span>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.viewProfile}>
                      View Portfolio
                      <ExternalLink size={14} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Stats */}
      <div className={styles.stats}>
        <span>{profiles.length} portfolios in our community</span>
      </div>
    </div>
  );
}
