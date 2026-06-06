import type { Metadata, Viewport } from "next";
import Script from "next/script"; // 1. Import Script for Analytics
import { FeedbackWidget } from "@/app/components/feedback/FeedbackWidget";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b0c",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://bentofolio.dev"
  ),
  title: {
    default: "BentoFolio - Bento Portfolio Builder for Creatives and Devs",
    template: "%s | BentoFolio",
  },
  description:
    "Create a polished bento portfolio for your work, links, socials, media, projects, and launch metrics. Start free with editable templates for creatives and developers.",
  keywords: [
    "developer portfolio",
    "creative portfolio",
    "bento grid",
    "portfolio builder",
    "bento portfolio",
    "developer tools",
    "creator portfolio",
    "tech portfolio",
    "personal website",
    "programmer portfolio",
  ],
  authors: [{ name: "BentoFolio" }],
  creator: "BentoFolio",
  publisher: "BentoFolio",
  // 2. Add Google Search Console Verification (Get this code from GSC)
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
    siteName: "BentoFolio",
    title: "BentoFolio - Bento Portfolio Builder for Creatives and Devs",
    description:
      "Create a polished bento portfolio for your work, links, socials, media, projects, and launch metrics. Start free with editable templates.",
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BentoFolio - Bento portfolio builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BentoFolio - Bento Portfolio Builder",
    description:
      "Build a bento-style portfolio for your work, socials, media, projects, and launch metrics.",
    images: ["/og-image.png"],
    creator: "@muhsench", // Add your actual Twitter handle here if you have one
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/icon.png?v=3", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: "/apple-icon.png?v=3",
  },
  manifest: "/manifest.json?v=3",
};

// 3. Schema Markup Data (Structured Data for SEO)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BentoFolio",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Create a bento portfolio for work, links, socials, media, projects, and launch metrics.",
  image: "/icon.png?v=3",
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
