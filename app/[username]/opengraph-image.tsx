import { ImageResponse } from "next/og";
import { OG, OG_SIZE, OgCheck, OgMark, imageDataUrl, initials, loadOgFonts } from "@/app/lib/og";
import { appUrl, publicPage } from "@/app/lib/public-page";
import { clamp } from "@/app/lib/profile-summary";
import { getProfileByUsername, getVerifiedRevenue } from "@/app/lib/supabase/profiles";

// The picture shown when someone shares bentofolio.dev/<name>: who they are
// and up to three proof points, in the page's own light or dark theme.
export const alt = "Profile on bentofolio";
export const size = OG_SIZE;
export const contentType = "image/png";
// Refreshed at most hourly; X and LinkedIn keep their own copy anyway.
export const revalidate = 3600;

const THEMES = {
  light: { bg: OG.soft, card: OG.card, line: OG.line, ink: OG.ink, body: OG.body, muted: OG.muted, accent: OG.accent, wash: OG.accentWash, good: OG.good, markInk: OG.ink },
  dark: { bg: "#0e0e0d", card: "#161615", line: "#262624", ink: "#f4f3ef", body: "#d6d5cf", muted: "#a3a29c", accent: "#5c70ff", wash: "#1d2140", good: "#4ccf7f", markInk: "#f4f3ef" },
};

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getProfileByUsername(username).catch(() => null);
  const page = profile ? publicPage(profile, await getVerifiedRevenue(profile.id)) : null;
  const summary = page?.summary;
  const handle = profile?.username ?? username.toLowerCase();
  const t = THEMES[profile?.theme === "dark" ? "dark" : "light"];

  const name = clamp(summary?.name ?? `@${handle}`, 36);
  const headline = clamp(summary?.headline || (profile ? "" : "This name is still free on bentofolio"), 64);
  const location = clamp(summary?.location ?? "", 40);
  const proofs = (summary?.proofs ?? []).map((proof) => ({ ...proof, value: clamp(proof.value, 44), label: clamp(proof.label, 22) }));
  const bio = proofs.length ? "" : clamp(summary?.bio ?? "", 150);
  const url = `bentofolio.dev/${handle}`;
  const avatar = await imageDataUrl(summary?.avatar, appUrl("/"));
  const nameSize = name.length > 28 ? 50 : name.length > 20 ? 60 : 72;

  const words = [name, headline, location, bio, url, "bentofolio Verified", ...proofs.flatMap((p) => [p.label, p.value]), initials(name)].join(" ");
  const fonts = await loadOgFonts(words);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "60px 72px 64px",
          background: t.bg,
          color: t.ink,
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <OgMark size={24} ink={t.markInk} accent={t.accent} />
            <div style={{ display: "flex", fontSize: 24, fontWeight: 600, letterSpacing: -0.4 }}>bentofolio</div>
          </div>
          <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 20, fontWeight: 500, color: t.muted }}>{url}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} width={148} height={148} alt="" style={{ borderRadius: 148, objectFit: "cover", border: `1px solid ${t.line}` }} />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 148,
                height: 148,
                borderRadius: 148,
                background: t.wash,
                color: t.accent,
                fontSize: 52,
                fontWeight: 600,
              }}
            >
              {initials(name)}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ display: "flex", fontSize: nameSize, fontWeight: 500, lineHeight: 1.05, letterSpacing: -nameSize * 0.035 }}>{name}</div>
              {profile?.isPro && <OgCheck size={Math.round(nameSize * 0.48)} color={t.accent} />}
            </div>
            {headline && <div style={{ display: "flex", fontSize: 32, lineHeight: 1.25, color: t.body }}>{headline}</div>}
            {location && (
              <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 20, fontWeight: 500, color: t.muted }}>{location}</div>
            )}
          </div>
        </div>

        {proofs.length > 0 ? (
          <div style={{ display: "flex", gap: 16 }}>
            {proofs.map((proof, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  flex: 1,
                  minWidth: 0,
                  padding: "20px 24px",
                  background: t.card,
                  border: `1px solid ${t.line}`,
                  borderRadius: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "Geist Mono", fontSize: 16, fontWeight: 500, color: t.muted }}>
                  <div style={{ display: "flex" }}>{proof.label}</div>
                  {proof.verified && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: t.accent }}>
                      <OgCheck size={16} color={t.accent} />
                      <div style={{ display: "flex" }}>Verified</div>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: proofs.length === 3 ? 26 : 30,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    letterSpacing: -0.6,
                  }}
                >
                  {proof.value}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", minHeight: 64, fontSize: 24, lineHeight: 1.45, color: t.body, maxWidth: 1000 }}>{bio}</div>
        )}
      </div>
    ),
    { ...size, fonts }
  );
}
