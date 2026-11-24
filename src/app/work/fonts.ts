import {
  Chivo,
  Cinzel,
  Geologica,
  Georama,
  Gruppo,
  Holtwood_One_SC,
  Jura,
  Orbitron,
  Revalia,
} from "next/font/google";

// Fontes usadas só nos cases. Sem pré-carregamento: são muitas, e cada case usa poucas na
// primeira tela (o texto aparece com a fonte de fallback e troca quando a fonte chega).
const chivo = Chivo({
  subsets: ["latin"],
  variable: "--nf-chivo",
  preload: false,
});
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--nf-cinzel",
  preload: false,
});
const geologica = Geologica({
  subsets: ["latin"],
  variable: "--nf-geologica",
  preload: false,
});
const georama = Georama({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--nf-georama",
  preload: false,
});
const gruppo = Gruppo({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-gruppo",
  preload: false,
});
const holtwood = Holtwood_One_SC({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-holtwood",
  preload: false,
});
const jura = Jura({
  subsets: ["latin"],
  variable: "--nf-jura",
  preload: false,
});
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--nf-orbitron",
  preload: false,
});
const revalia = Revalia({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-revalia",
  preload: false,
});

export const caseFontVariables = [
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
