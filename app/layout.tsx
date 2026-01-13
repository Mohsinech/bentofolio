import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
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
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
