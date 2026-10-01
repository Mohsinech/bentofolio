import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getProfileByUsername,
  resolveUsernameRedirect,
} from "@/app/lib/supabase/profiles";
import { ProfileClientWrapper } from "./ProfileClientWrapper";
import { PublicProfileShell } from "./PublicProfileShell";
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

  if (!profile) {
    // Renamed in the last 30 days: send visitors to the new address.
    // Temporary redirect, since the old name is released after 30 days.
    const currentUsername = await resolveUsernameRedirect(username);
    if (currentUsername) {
      redirect(`/${encodeURIComponent(currentUsername)}`);
    }
  }

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

  return (
    <ProfileClientWrapper
      username={profile.username}
      isPro={profile.isPro}
      theme={profile.theme}
    >
      <PublicProfileShell
        username={profile.username}
        isPro={profile.isPro}
        theme={profile.theme}
        avatarUrl={profile.avatarUrl}
        layout={profile.layout}
        layoutVersion={profile.layoutVersion}
        content={profile.content}
      />
    </ProfileClientWrapper>
  );
}
