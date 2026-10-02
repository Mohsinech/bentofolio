import { ImageResponse } from "next/og";
import { OG, OG_SIZE, OgCheck, OgMark, loadOgFonts } from "@/app/lib/og";

// Link preview for bentofolio.dev itself (X, LinkedIn, Slack, iMessage…).
export const alt = "bentofolio: your proof of work, arranged";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 86400;

const BARS = [38, 46, 44, 58, 66, 80, 92];

function Tile({ children, wide = false, style = {} }: { children: React.ReactNode; wide?: boolean; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: wide ? 452 : 218,
        padding: "20px 22px",
        background: OG.card,
        border: `1px solid ${OG.line}`,
        borderRadius: 22,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 15, fontWeight: 500, color: OG.muted }}>{children}</div>;
}

export default async function Image() {
  const words =
    "bentofolio Your proof of work, Drag projects, roles, links and revenue into one grid. bentofolio.dev Free to start Mira Chen Product engineer Lisbon Northwind MRR Verified GitHub stars Now Design engineer at Fieldnote MC";
  const fonts = await loadOgFonts(words, "arranged.");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "64px 64px 64px 72px",
          background: OG.soft,
          color: OG.ink,
          fontFamily: "Geist",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <OgMark size={30} />
            <div style={{ display: "flex", fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>bentofolio</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 500, lineHeight: 1.02, letterSpacing: -2.6 }}>
              <div style={{ display: "flex" }}>Your proof</div>
              <div style={{ display: "flex" }}>of work,</div>
              <div style={{ display: "flex", fontFamily: "Instrument Serif", fontStyle: "italic", fontWeight: 400, fontSize: 84, letterSpacing: -0.8, color: OG.accent }}>
                arranged.
              </div>
            </div>
            <div style={{ display: "flex", fontSize: 26, lineHeight: 1.4, color: OG.body, maxWidth: 500 }}>
              Drag projects, roles, links and revenue into one grid.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Geist Mono", fontSize: 20, fontWeight: 500, color: OG.muted }}>
            <div style={{ display: "flex" }}>bentofolio.dev</div>
            <div style={{ display: "flex", width: 5, height: 5, borderRadius: 5, background: OG.muted }} />
            <div style={{ display: "flex" }}>Free to start</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, width: 452 }}>
          <Tile wide style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: 64,
                background: OG.accentWash,
                color: OG.accent,
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              MC
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", fontSize: 28, fontWeight: 600, letterSpacing: -0.6 }}>Mira Chen</div>
              <div style={{ display: "flex", fontSize: 19, color: OG.body }}>Product engineer · Lisbon</div>
            </div>
          </Tile>
          <div style={{ display: "flex", gap: 16 }}>
            <Tile style={{ height: 196 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Label>Northwind</Label>
                <OgCheck size={22} />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 64 }}>
                {BARS.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      width: 18,
                      height: `${h}%`,
                      borderRadius: "4px 4px 0 0",
                      background: i === BARS.length - 1 ? OG.accent : "#7585ff",
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div style={{ display: "flex", fontSize: 34, fontWeight: 600, letterSpacing: -1 }}>$4.2k</div>
                <div style={{ display: "flex", fontSize: 18, color: OG.body }}>MRR</div>
              </div>
            </Tile>
            <Tile style={{ height: 196 }}>
              <Label>GitHub</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", fontSize: 34, fontWeight: 600, letterSpacing: -1 }}>1.2k</div>
                <div style={{ display: "flex", fontSize: 18, color: OG.body }}>stars</div>
              </div>
            </Tile>
          </div>
          <Tile wide style={{ gap: 8 }}>
            <Label>Now</Label>
            <div style={{ display: "flex", fontSize: 22, fontWeight: 500 }}>Design engineer at Fieldnote</div>
          </Tile>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
