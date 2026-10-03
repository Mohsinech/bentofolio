// What Pro unlocks, in one place: the upgrade dialog, the thank-you page and
// the receipt email all read from here.

export type ProFeature = "analytics" | "domain" | "embeds" | "badge" | "pdf" | "tag";

export const PRO_FEATURES: Record<ProFeature, { item: string; title: string; line: string }> = {
  analytics: {
    item: "Analytics: visitors, sources, countries, clicks",
    title: "See who visits your page.",
    line: "Views, unique visitors, where they came from and which links they clicked.",
  },
  domain: {
    item: "Your own domain",
    title: "Put your page on your own domain.",
    line: "Show your page at mira.design or cv.mira.design. We handle the certificate.",
  },
  embeds: {
    item: "Spotify, YouTube and Instagram blocks",
    title: "Add Spotify, YouTube and Instagram.",
    line: "Media blocks that play right on your page.",
  },
  badge: {
    item: "Verified badge next to your name",
    title: "Get the verified badge.",
    line: "A small check next to your name, on your page and in link previews.",
  },
  pdf: {
    item: "Download your CV as a PDF",
    title: "Send your CV as a PDF.",
    line: "A clean, ATS-friendly PDF of your CV view, one click away.",
  },
  tag: {
    item: "No “Made with bentofolio” tag",
    title: "Remove the bentofolio tag.",
    line: "Your page, without our name at the bottom.",
  },
};

export const PRO_FEATURE_ORDER: ProFeature[] = ["analytics", "domain", "embeds", "badge", "pdf", "tag"];

// The full list, with the feature someone asked about first.
export function proItems(first?: ProFeature | null): { key: ProFeature; item: string }[] {
  const order = first ? [first, ...PRO_FEATURE_ORDER.filter((key) => key !== first)] : PRO_FEATURE_ORDER;
  return order.map((key) => ({ key, item: PRO_FEATURES[key].item }));
}
