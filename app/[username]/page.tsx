import { Metadata } from "next";
import Link from "next/link";

import { getProfileByUsername } from "@/app/lib/supabase/profiles";
import { PublicGrid } from "./PublicGrid";
import { Watermark } from "@/app/components/Watermark";
import { ProfileClientWrapper } from "./ProfileClientWrapper";
import { ExportButton } from "./ExportButton";
import styles from "./profile.module.css";

interface PageProps {
  params: Promise<{ username: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    return {
      title: "Profile Not Found | BentoFolio",
    };
  }

  // Try to find identity block for name
  const identityContent = Object.values(profile.content).find(
    (c) => c.type === "identity"
  );
  const name =
    identityContent?.type === "identity" ? identityContent.data.name : username;
  const title =
    identityContent?.type === "identity" ? identityContent.data.title : "";

  return {
    title: `${name} | BentoFolio`,
    description: title || `${name}'s portfolio on BentoFolio`,
    openGraph: {
      title: `${name} | BentoFolio`,
      description: title || `${name}'s portfolio on BentoFolio`,
      type: "profile",
      url: `https://bentofolio.dev/${username}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | BentoFolio`,
      description: title || `${name}'s portfolio on BentoFolio`,
    },
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  // If no profile found, show 404
  if (!profile) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>404</h1>
        <p className={styles.notFoundText}>
          This profile doesn&apos;t exist yet.
        </p>
        <Link href="/auth/signup" className={styles.notFoundLink}>
          Claim @{username}
        </Link>
      </div>
    );
  }

  // If profile has no layout, show empty state
  if (profile.layout.length === 0) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>🚧</h1>
        <p className={styles.notFoundText}>
          @{username} is still building their portfolio.
        </p>
        <Link href="/" className={styles.notFoundLink}>
          Create Yours
        </Link>
      </div>
    );
  }

  return (
    <ProfileClientWrapper
      username={profile.username}
      isPro={profile.isPro}
      theme={profile.theme}
    >
      <div className={styles.page}>
        <header className={styles.header}>
          <p className={styles.username}>@{profile.username}</p>
          <ExportButton username={profile.username} />
        </header>

        <div className={styles.grid} id="public-portfolio-grid">
          <PublicGrid
            layout={profile.layout}
            content={profile.content}
            isPro={profile.isPro}
          />
        </div>

        {/* Show watermark for free users */}
        <Watermark show={!profile.isPro} />
      </div>
    </ProfileClientWrapper>
  );
}
