import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  getProfileByUsername,
  getVerifiedRevenue,
  resolveUsernameRedirect,
} from "@/app/lib/supabase/profiles";
import { canonicalUrl, publicPage } from "@/app/lib/public-page";
import { describeProfile } from "@/app/lib/profile-summary";
import { ProfileClientWrapper } from "./ProfileClientWrapper";
import { PublicProfileShell } from "./PublicProfileShell";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ view?: string }>;
}

// Title, description and canonical address. The link preview picture comes
// from opengraph-image.tsx next to this file.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) {
    return { title: "Page not found", robots: { index: false } };
  }

  const { summary } = publicPage(profile, await getVerifiedRevenue(profile.id));
  const title = summary.headline ? `${summary.name} — ${summary.headline}` : summary.name;
  const description = describeProfile(summary);
  const url = canonicalUrl(profile);

  return {
    // The page is theirs: no "| BentoFolio" on the end.
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // Pages with only a placeholder name aren't worth indexing yet.
    robots: summary.hasName ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description,
      type: "profile",
      url,
      siteName: "bentofolio",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const requestedView = (await searchParams)?.view;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    // Renamed in the last 30 days: send visitors to the new address.
    // Temporary redirect, since the old name is released after 30 days.
    const currentUsername = await resolveUsernameRedirect(username);
    if (currentUsername) {
      redirect(`/${encodeURIComponent(currentUsername)}`);
    }
  }

  if (!profile) notFound();

  const { content, summary } = publicPage(profile, await getVerifiedRevenue(profile.id));
  // Structured data so search engines know this page is about a person.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: canonicalUrl(profile),
    mainEntity: {
      "@type": "Person",
      name: summary.name.replace(/^@/, ""),
      alternateName: `@${profile.username}`,
      ...(summary.headline ? { jobTitle: summary.headline } : {}),
      ...(summary.bio ? { description: summary.bio } : {}),
      ...(summary.location ? { address: { "@type": "PostalAddress", addressLocality: summary.location } } : {}),
      ...(summary.avatar && /^https?:\/\//.test(summary.avatar) ? { image: summary.avatar } : {}),
      ...(summary.links.length ? { sameAs: summary.links } : {}),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // "<" escaped so page text can't close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
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
          content={content}
          initialView={requestedView === "cv" || requestedView === "grid" ? requestedView : profile.defaultView}
          showMadeWith={profile.showMadeWith}
        />
      </ProfileClientWrapper>
    </>
  );
}
