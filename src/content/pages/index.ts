import type { PageData } from "@/components/FigmaCanvas";
import type { PageConfig, PageLink } from "@/components/FigmaPage";
import about from "./about.json";
import aboutHoverWork from "./about-hover-work.json";
import home from "./home.json";
import homeHoverItau from "./home-hover-itau.json";
import homeHoverTrama from "./home-hover-trama.json";
import homeHoverTutti from "./home-hover-tutti.json";
import itau from "./itau.json";
import mAbout1 from "./m-about-1.json";
import mAbout2 from "./m-about-2.json";
import mAbout3 from "./m-about-3.json";
import mAbout4 from "./m-about-4.json";
import mHome from "./m-home.json";
import mHomeItau from "./m-home-itau.json";
import mHomeTrama from "./m-home-trama.json";
import mHomeTutti from "./m-home-tutti.json";
import mItau from "./m-itau.json";
import mTrama from "./m-trama.json";
import mTuttifree from "./m-tuttifree.json";
import trama from "./trama.json";
import tuttifree from "./tuttifree.json";

// Dados gerados por scripts/gerar-v2.sh a partir do export do Figma (v2: web + mobile). Aqui ficam
// só os links, os títulos e os hovers, por node-id.

const d = (json: unknown) => json as PageData;
const EMAIL = "mailto:laura_siufi@hotmail.com";
const nav = (work: string, about: string, brand?: string, pad = 0) =>
  [
    ...(brand ? [{ href: "/", label: "Laura Siufi", ids: [brand], pad }] : []),
    { href: "/", label: "Work", ids: [work], pad },
    { href: "/about", label: "About", ids: [about], pad },
  ] satisfies PageLink[];
const toTop = (id: string) => ({
  href: "#top",
  label: "Back to top",
  ids: [id],
  pad: 8,
});

export const homePage = {
  desktop: {
    data: d(home),
    titleId: "97:184",
    links: [
      ...nav("97:179", "97:180"),
      {
        href: "/work/tuttifree",
        label: "TuttiFree - Brand identity and interface",
        ids: ["97:199", "97:189"],
        hover: {
          variant: 0,
          ids: ["97:243", "97:244", "97:233", "97:220", "102:1799"],
        },
      },
      {
        href: "/work/itau",
        label: "Itaú and EBAC - UX/UI Case Study",
        ids: ["97:205", "97:204", "97:175", "97:210"],
        hover: { variant: 1, ids: ["102:313", "102:312", "102:311"] },
      },
      {
        href: "/work/trama",
        label: "EBAC Project TRAMA - UX/UI Case Study",
        ids: ["97:211", "97:216", "97:173", "97:174", "97:176", "97:217"],
        hover: {
          variant: 2,
          ids: ["102:369", "102:374", "102:333", "102:368", "102:1801"],
        },
      },
      { href: EMAIL, label: "laura_siufi@hotmail.com", ids: ["97:268"] },
      toTop("97:270"),
    ],
    // Hovers animados até os frames de hover do Figma. Os frames não estão todos na mesma altura da
    // base: `dy` alinha o título do card; o que fica abaixo desce (`shift`) como no Figma.
    variants: [
      {
        data: d(homeHoverTutti),
        // Card cresce; a elipse e o texto aparecem atrás/abaixo; a seta fica laranja.
        morph: [
          ["97:190", "97:234"],
          ["97:191", "97:235"],
          ["97:192", "97:236"],
          ["97:193", "97:237"],
          ["97:194", "97:238"],
          ["97:195", "97:239"],
          ["97:196", "97:240"],
          ["97:197", "97:241"],
          ["97:198", "97:242"],
        ],
        enter: [
          { ids: ["97:220"], before: "97:190" },
          { ids: ["102:1799", "97:246"] },
        ],
        exit: ["97:203"],
        shift: { from: 2150, by: 2465 - 2225 },
      },
      {
        data: d(homeHoverItau),
        dy: 2225 - 2186,
        // Celulares crescem, a faixa laranja abre e o "more about" dá lugar ao texto.
        morph: [
          ["97:204", "102:312"],
          ["97:175", "102:311"],
        ],
        enter: [{ ids: ["102:1800", "102:316"] }],
        exit: ["97:210", "97:208"],
        shift: { from: 3100, by: 3222 + (2225 - 2186) - 3188 },
      },
      {
        data: d(homeHoverTrama),
        dy: 3188 - 3199,
        // Celular cresce e as faixas creme se abrem; a foto e o "more about" saem.
        morph: [
          ["97:216", "102:374"],
          ["97:173", "102:333"],
          ["97:174", "102:368"],
        ],
        enter: [{ ids: ["102:1801", "102:372"] }],
        exit: ["97:176", "97:217", "97:214"],
        shift: { from: 4100, by: 4220 + (3188 - 3199) - 4160 },
      },
    ],
  },
  mobile: {
    hero: {
      data: d(mHome),
      titleId: "67:108",
      links: nav("67:110", "67:111", undefined, 8),
    },
    slides: [
      {
        id: "work-tuttifree",
        data: d(mHomeTutti),
        links: [
          {
            href: "/work/tuttifree",
            label: "TuttiFree - Brand identity and interface",
            ids: ["77:189", "77:190", "77:202", "77:188"],
          },
          { href: "#work-itau", label: "Next", ids: ["77:216"] },
        ],
      },
      {
        id: "work-itau",
        data: d(mHomeItau),
        links: [
          {
            href: "/work/itau",
            label: "Itaú and EBAC - UX/UI Case Study",
            ids: ["77:258", "77:251", "77:260", "77:261"],
          },
          { href: "#work-trama", label: "Next", ids: ["77:244"] },
        ],
      },
      {
        id: "work-trama",
        data: d(mHomeTrama),
        links: [
          {
            href: "/work/trama",
            label: "EBAC Project TRAMA - UX/UI Case Study",
            ids: ["77:286", "77:280", "77:285", "77:265", "77:276"],
          },
          { href: "#work-tuttifree", label: "Next", ids: ["77:270"] },
        ],
      },
    ],
  },
} satisfies {
  desktop: PageConfig;
  mobile: {
    hero: PageConfig;
    slides: (PageConfig & { id: string })[];
  };
};

export const aboutPage = {
  desktop: {
    data: d(about),
    titleId: "116:47",
    links: [
      { href: "/", label: "Laura Siufi", ids: ["102:1817"] },
      {
        href: "/",
        label: "Work",
        ids: ["102:1807"],
        hover: { variant: 0, ids: ["116:84"] },
      },
      { href: "/about", label: "About", ids: ["102:1808"] },
      { href: EMAIL, label: "laura_siufi@hotmail.com", ids: ["102:1811"] },
      toTop("102:1813"),
    ],
    // Só o menu muda no hover do "Work": o texto laranja entra no lugar do preto.
    variants: [
      {
        data: d(aboutHoverWork),
        enter: [{ ids: ["116:84"] }],
        exit: ["102:1807"],
      },
    ],
  },
  mobile: [
    {
      data: d(mAbout1),
      titleId: "116:118",
      links: nav("77:292", "77:293", "77:291", 8),
    },
    { data: d(mAbout2) },
    { data: d(mAbout3) },
    {
      data: d(mAbout4),
      links: [
        { href: EMAIL, label: "laura_siufi@hotmail.com", ids: ["77:353"] },
      ],
    },
  ],
} satisfies { desktop: PageConfig; mobile: PageConfig[] };

const back = (id: string) => ({
  href: "/",
  label: "Back",
  ids: [id],
  pad: 16,
});

export const cases = {
  tuttifree: {
    title: "TuttiFree — Brand Strategy e Identidade Visual",
    desktop: {
      data: d(tuttifree),
      titleId: "102:1229",
      links: [back("102:1348")],
    },
    mobile: {
      data: d(mTuttifree),
      titleId: "67:417",
      links: nav("67:391", "67:392", "67:407", 8),
    },
  },
  itau: {
    title: "Itaú — Redesign da experiência financeira",
    desktop: { data: d(itau), titleId: "102:550", links: [back("102:1207")] },
    mobile: {
      data: d(mItau),
      title: "Itaú — Redesign da experiência financeira",
      links: nav("70:557", "70:558", "70:559", 8),
    },
  },
  trama: {
    title: "TRAMA — Case Study",
    desktop: { data: d(trama), titleId: "102:1372", links: [back("102:1777")] },
    mobile: {
      data: d(mTrama),
      title: "TRAMA — Case Study",
      links: nav("76:124", "76:125", "76:126", 8),
    },
  },
} satisfies Record<
  string,
  { title: string; desktop: PageConfig; mobile: PageConfig }
>;

export type CaseSlug = keyof typeof cases;
export const isCaseSlug = (s: string): s is CaseSlug => s in cases;
