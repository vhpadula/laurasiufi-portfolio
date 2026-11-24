import Link from "next/link";
import { FigmaCanvas, type PageData, type PageNode } from "./FigmaCanvas";
import { place } from "@/lib/place";

/** Área clicável sobre o canvas: a união das caixas dos nós `ids` (+ `pad` px do Figma). */
export type PageLink = {
  href: string;
  label: string;
  ids: string[];
  pad?: number;
  /** Ao passar o mouse (ou focar), mostra a variação `variant` (índice em `variants`). */
  hover?: { variant: number; ids: string[] };
};

/**
 * Estado de hover desenhado em outro frame do Figma (`data`). Em vez de trocar de frame, a página
 * anima até ele: `morph` leva cada nó da base [id base, id variação] à caixa do nó na variação,
 * `enter` traz nós que só existem na variação (com fade, antes do nó `before` na ordem de desenho),
 * `exit` some com nós que só existem na base e `shift` empurra para baixo o que fica abaixo de `from`
 * (px da base). `dy` alinha a variação com a base (os frames de hover não estão sempre na mesma altura).
 */
export type Variant = {
  data: PageData;
  dy?: number;
  morph?: [string, string][];
  enter?: { ids: string[]; before?: string }[];
  exit?: string[];
  shift?: { from: number; by: number };
};

export type PageConfig = {
  data: PageData;
  /** Texto do Figma que vira o <h1>; sem ele, `title` vira um <h1> só para leitores de tela. */
  titleId?: string;
  title?: string;
  links?: PageLink[];
  variants?: Variant[];
};

function union(data: PageData, ids: string[], pad = 0) {
  const boxes = ids.map((id) => {
    const b = data.boxes[id];
    if (!b) throw new Error(`${data.slug}: nó ${id} não existe`);
    return b;
  });
  const x = Math.min(...boxes.map((b) => b[0])) - pad;
  const y = Math.min(...boxes.map((b) => b[1])) - pad;
  const r = Math.max(...boxes.map((b) => b[0] + b[2])) + pad;
  const btm = Math.max(...boxes.map((b) => b[1] + b[3])) + pad;
  return [x, y, r - x, btm - y];
}

/** Procura um nó pelo id, inclusive dentro de grupos e frames. */
function find(nodes: PageNode[], id: string): PageNode | undefined {
  for (const n of nodes) {
    if ("id" in n && n.id === id) return n;
    const inner =
      "children" in n && n.children ? find(n.children, id) : undefined;
    if (inner) return inner;
  }
}

/** Nós desenhados direto na página (grupos são achatados; filhos de frames se movem com o frame). */
function topLevel(nodes: PageNode[]): PageNode[] {
  return nodes.flatMap((n) => (n.k === "group" ? topLevel(n.children) : [n]));
}

/**
 * Uma página do Figma: o canvas, as áreas de link por cima e os hovers animados. Os hovers são só
 * CSS (`:has(:hover)` + transições), sem JavaScript.
 */
export function FigmaPage({
  id,
  config,
}: {
  /** Identificador único na página (escopo do CSS dos hovers). */
  id: string;
  config: PageConfig;
}) {
  const { titleId, title, links = [], variants = [] } = config;
  const W = config.data.width;
  const p = place(W);
  const u = (v: number) => `calc(${v} * 100cqw / ${W})`;
  const scope = `[data-fp="${id}"]`;

  // Nós que só existem nos hovers entram na base, invisíveis, na posição da ordem de desenho.
  const nodes = [...config.data.nodes];
  variants.forEach((v, vi) =>
    v.enter?.forEach((e, ei) => {
      const group: PageNode = {
        k: "group",
        id: `enter-${vi}-${ei}`,
        opacity: 0,
        dy: v.dy,
        children: e.ids.map((nid) => {
          const n = find(v.data.nodes, nid);
          if (!n) throw new Error(`${v.data.slug}: nó ${nid} não existe`);
          return n;
        }),
      };
      const at = e.before ? nodes.findIndex((n) => find([n], e.before!)) : -1;
      nodes.splice(at < 0 ? nodes.length : at, 0, group);
    }),
  );
  const data = { ...config.data, nodes };

  const css = links
    .map((l, i) => {
      if (!l.hover) return "";
      const v = variants[l.hover.variant];
      const dy = v.dy ?? 0;
      const on = `${scope}:has([data-t="${i}"]:is(:hover, :focus-visible))`;
      const sel = (ids: string[]) =>
        `${on} :is(${ids.map((n) => `[data-n="${n}"]`).join(",")})`;
      const rules: string[] = [];
      // O estilo inline define as variáveis da base; no hover, a área do link cresce para a da variação.
      const [x, y, w, h] = union(v.data, l.hover.ids, l.pad);
      rules.push(
        `${scope} [data-t="${i}"]:hover{--x:${x}!important;--y:${y + dy}!important;--w:${w}!important;--h:${h}!important}`,
      );
      for (const [from, to] of v.morph ?? []) {
        const n = find(v.data.nodes, to);
        if (!n || n.k === "group") throw new Error(`${v.data.slug}: nó ${to}`);
        rules.push(
          `${sel([from])}{--x:${n.x}!important;--y:${n.y + dy}!important;--w:${n.w}!important;--h:${n.h ?? 0}!important}`,
        );
      }
      v.enter?.forEach((_, ei) =>
        rules.push(
          `${sel([`enter-${l.hover!.variant}-${ei}`])}{opacity:1!important}`,
        ),
      );
      if (v.exit?.length) rules.push(`${sel(v.exit)}{opacity:0!important}`);
      if (v.shift) {
        const below = topLevel(config.data.nodes).filter(
          (n) => n.k !== "group" && n.id && n.y >= v.shift!.from,
        );
        rules.push(
          `${sel(below.map((n) => ("id" in n ? n.id! : "")))}{margin-top:${u(v.shift.by)}}`,
        );
      }
      return rules.join("");
    })
    .join("");

  return (
    <div data-fp={id} className={`cv ${variants.length ? "morph" : ""}`}>
      {!titleId && title && <h1 className="sr-only">{title}</h1>}
      <FigmaCanvas data={data} opts={{ titleId }} />
      {links.map((l, i) => {
        const [x, y, w, h] = union(data, l.ids, l.pad);
        const props = {
          "aria-label": l.label,
          "data-t": i,
          className:
            "abs z-10 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
          style: p(x, y, w, h),
        };
        return l.href.startsWith("/") ? (
          <Link key={i} href={l.href} {...props} />
        ) : (
          <a key={i} href={l.href} {...props} />
        );
      })}
      {css && <style>{css}</style>}
    </div>
  );
}

/** Desktop a partir de 768px; abaixo, o layout mobile do Figma. */
export function Responsive({
  desktop,
  mobile,
  bg,
}: {
  desktop: React.ReactNode;
  mobile: React.ReactNode;
  /** Fundo da página, que continua além dos 1440px. */
  bg?: string;
}) {
  return (
    <div className="overflow-x-clip" style={{ background: bg }}>
      <main className="relative mx-auto max-w-[1440px] max-md:hidden">
        {desktop}
      </main>
      <main className="relative md:hidden">{mobile}</main>
    </div>
  );
}
