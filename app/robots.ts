import type { MetadataRoute } from "next";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://bentofolio.dev").replace(/\/$/, "");

// Public pages are open; the app itself (editor, settings, sign-in) isn't
// worth crawling.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/editor", "/settings", "/onboarding", "/auth/", "/invite", "/admin", "/v2-preview"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
