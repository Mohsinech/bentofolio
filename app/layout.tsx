import type { Metadata, Viewport } from "next";
import Script from "next/script"; // 1. Import Script for Analytics
import { FeedbackWidget } from "@/app/components/feedback/FeedbackWidget";
import { PREMIUM_PRICE } from "@/app/lib/config";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fcfcfb",
};

const DESCRIPTION =
  "Your proof of work, arranged. Drag projects, roles, links and metrics into one bento grid, and show revenue verified by Stripe or Lemon Squeezy. Free to start.";

// The link preview picture is app/opengraph-image.tsx (profiles have their own).
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://bentofolio.dev"),
  title: {
    default: "bentofolio — your proof of work, arranged",
    template: "%s · bentofolio",
  },
  description: DESCRIPTION,
  applicationName: "bentofolio",
  keywords: [
    "developer portfolio",
    "portfolio builder",
    "bento portfolio",
    "bento grid",
    "verified revenue",
    "indie hacker portfolio",
    "personal website",
    "online CV",
  ],
  authors: [{ name: "bentofolio", url: "https://bentofolio.dev" }],
  creator: "bentofolio",
  publisher: "bentofolio",
  verification: {
    google: "__l-ONwyc07s3za9EkP-3PiWoD014U2g8zVzc9Dd12I",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "bentofolio",
    title: "bentofolio — your proof of work, arranged",
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "bentofolio — your proof of work, arranged",
    description: DESCRIPTION,
    creator: "@muhsench",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/icon.png?v=3", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: "/apple-icon.png?v=3",
  },
  manifest: "/manifest.json?v=4",
};

// Structured data for search engines.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "bentofolio",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://bentofolio.dev",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: String(PREMIUM_PRICE), priceCurrency: "USD" },
  ],
  description: DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* 4. Inject Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        {/* 5. Google Analytics (Replace G-XXXXXXXXXX with your ID) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9XSZH2R67Q"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9XSZH2R67Q');
          `}
        </Script>

        {children}
        <FeedbackWidget />
      </body>
    </html>
  );
}
