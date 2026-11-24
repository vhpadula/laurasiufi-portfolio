import {
  Bruno_Ace_SC,
  Chivo,
  Cinzel,
  Content,
  Contrail_One,
  Darker_Grotesque,
  Geologica,
  Georama,
  Gruppo,
  Holtwood_One_SC,
  Jura,
  Notable,
  Noto_Sans,
  Orbitron,
  Revalia,
} from "next/font/google";

// Todas as famílias do Figma (v2). As variáveis cobrem todos os pesos; as de peso único declaram 400.
const contrailOne = Contrail_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-contrail",
});
const notable = Notable({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-notable",
});
const darkerGrotesque = Darker_Grotesque({
  subsets: ["latin"],
  variable: "--nf-grotesque",
});
// Content só tem khmer, dígitos e pontuação (U+20–40): as letras caem no fallback. No Figma o
// fallback é Noto Sans; medido contra o export, é a combinação que bate.
const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--nf-noto" });
const content = Content({
  weight: "400",
  subsets: ["khmer"],
  variable: "--nf-content",
  fallback: ["Noto Sans"],
  adjustFontFallback: false,
});
const brunoAceSc = Bruno_Ace_SC({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-bruno",
});
const chivo = Chivo({ subsets: ["latin"], variable: "--nf-chivo" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--nf-cinzel" });
const geologica = Geologica({ subsets: ["latin"], variable: "--nf-geologica" });
const georama = Georama({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--nf-georama",
});
const gruppo = Gruppo({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-gruppo",
});
const holtwood = Holtwood_One_SC({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-holtwood",
});
const jura = Jura({ subsets: ["latin"], variable: "--nf-jura" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--nf-orbitron" });
const revalia = Revalia({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-revalia",
});

export const fontVariables = [
  contrailOne,
  notable,
  darkerGrotesque,
  notoSans,
  content,
  brunoAceSc,
  chivo,
  cinzel,
  geologica,
  georama,
  gruppo,
  holtwood,
  jura,
  orbitron,
  revalia,
]
  .map((f) => f.variable)
  .join(" ");
