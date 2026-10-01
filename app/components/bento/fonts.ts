import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

// Typefaces for the bento page design ("Quiet proof"): Geist for text,
// Geist Mono for labels and dates, Instrument Serif for the occasional accent.
export const bentoSans = Geist({ subsets: ["latin"], variable: "--bento-sans", display: "swap" });
export const bentoMono = Geist_Mono({ subsets: ["latin"], variable: "--bento-mono", display: "swap" });
export const bentoSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--bento-serif",
  display: "swap",
});

export const bentoFontClasses = `${bentoSans.variable} ${bentoMono.variable} ${bentoSerif.variable}`;
