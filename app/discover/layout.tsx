import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover",
  description: "Bento portfolios from developers, designers and indie hackers on bentofolio.",
  alternates: { canonical: "/discover" },
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
