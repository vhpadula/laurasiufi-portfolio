import {
  Bruno_Ace_SC,
  Content,
  Contrail_One,
  Darker_Grotesque,
  Notable,
  Noto_Sans,
} from "next/font/google";

// Fontes da home e do About (as dos cases ficam em src/app/work/fonts.ts, só nas rotas /work).
// Só as da primeira tela são pré-carregadas; as demais carregam quando aparecem.
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
// fallback é Noto Sans; medido contra o export, é a combinação que bate. Só no e-mail, no rodapé.
const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--nf-noto",
  preload: false,
});
const content = Content({
  weight: "400",
  subsets: ["khmer"],
  variable: "--nf-content",
  fallback: ["Noto Sans"],
  adjustFontFallback: false,
  preload: false,
});
// Bruno Ace SC: só num texto do About que fica fora do frame (102:1810).
const brunoAceSc = Bruno_Ace_SC({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-bruno",
  preload: false,
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
