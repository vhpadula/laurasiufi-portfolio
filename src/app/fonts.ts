import {
  Bruno_Ace_SC,
  Content,
  Contrail_One,
  Darker_Grotesque,
  Notable,
  Noto_Sans,
} from "next/font/google";

export const contrailOne = Contrail_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-contrail",
});
export const notable = Notable({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-notable",
});
export const darkerGrotesque = Darker_Grotesque({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-grotesque",
});
// Content só tem khmer, dígitos e pontuação (U+20–40): as letras caem no fallback. No Figma o
// fallback é Noto Sans; medido contra o export, é a combinação que bate (largura 420 vs 422).
export const notoSans = Noto_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-noto",
});
export const content = Content({
  weight: "400",
  subsets: ["khmer"],
  variable: "--nf-content",
  fallback: ["Noto Sans"],
  adjustFontFallback: false,
});
export const brunoAceSc = Bruno_Ace_SC({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-bruno",
});

export const fontVariables = [
  contrailOne,
  notable,
  darkerGrotesque,
  notoSans,
  content,
  brunoAceSc,
]
  .map((f) => f.variable)
  .join(" ");
