import type { Metadata, Viewport } from "next";
import Script from "next/script"; // 1. Import Script for Analytics
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
    default: "BentoFolio - Create Beautiful Developer Portfolios",
    template: "%s | BentoFolio",
  },
  description:
    "Build stunning bento-style portfolio pages in minutes. Showcase your projects, tech stack, and experience with beautiful, customizable blocks.",
  keywords: [
    "developer portfolio",
    "bento grid",
    "portfolio builder",
    "developer tools",
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
    title: "BentoFolio - Create Beautiful Developer Portfolios",
    description:
      "Build stunning bento-style portfolio pages in minutes. Showcase your projects, tech stack, and experience with beautiful, customizable blocks.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BentoFolio - Developer Portfolio Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BentoFolio - Create Beautiful Developer Portfolios",
    description:
      "Build stunning bento-style portfolio pages in minutes. Showcase your projects, tech stack, and experience.",
    images: ["/og-image.png"],
    creator: "@muhsench", // Add your actual Twitter handle here if you have one
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

// 3. Schema Markup Data (Structured Data for SEO)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BentoFolio",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description: "Build stunning bento-style portfolio pages in minutes.",
  image: "/icon.png", // Ensure this path matches your icon
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
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
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
      </body>
    </html>
  );
}
