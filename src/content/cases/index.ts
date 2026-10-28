import type { CaseData, CaseOptions } from "@/components/FigmaCanvas";
import itau from "./itau.json";
import trama from "./trama.json";
import tuttifree from "./tuttifree.json";

// Dados gerados por `node scripts/gerar-case.mjs <slug> [página]` a partir do export do Figma.
// Para regenerar depois de mudar o Figma: exportar pelo plugin, `importar` e rodar o gerador.
export const cases = {
  tuttifree: {
    title: "TuttiFree — Brand Strategy e Identidade Visual",
    data: tuttifree as CaseData,
    opts: { titleId: "47:36", links: { "48:164": "/" } },
  },
  itau: {
    title: "Itaú — Redesign da experiência financeira",
    data: itau as CaseData,
    opts: { titleId: "18:41", links: { "48:159": "/" } },
  },
  trama: {
    title: "TRAMA — Case Study",
    data: trama as CaseData,
    opts: { titleId: "29:33570", links: { "48:162": "/" } },
  },
} satisfies Record<
  string,
  { title: string; data: CaseData; opts: CaseOptions }
>;

export type CaseSlug = keyof typeof cases;
export const isCaseSlug = (s: string): s is CaseSlug => s in cases;
