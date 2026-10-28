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

// Fontes usadas só nos cases (Figma: 47:22, 18:5, 29:33550). As variáveis cobrem todos os pesos.
const chivo = Chivo({ subsets: ["latin"], variable: "--nf-chivo" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--nf-cinzel" });
const geologica = Geologica({ subsets: ["latin"], variable: "--nf-geologica" });
const georama = Georama({ subsets: ["latin"], variable: "--nf-georama" });
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
