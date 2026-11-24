import Link from "next/link";
import { FigmaCanvas, type PageData } from "./FigmaCanvas";
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
 * Variação de hover: outro frame do Figma desenhado por cima da página. `dy` alinha a variação com a
 * base (os frames de hover não estão sempre na mesma altura) e `clip` = [topo, base] limita a parte
 * mostrada (px do frame da variação), para o resto continuar o da base.
 */
export type Variant = { data: PageData; dy?: number; clip?: [number, number?] };

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

/**
 * Uma página do Figma: o canvas, as variações de hover e as áreas de link por cima. As variações
 * aparecem por CSS (`:has(:hover)`), sem JavaScript.
 */
export function FigmaPage({
  id,
  config,
}: {
  /** Identificador único na página (escopo do CSS das variações). */
  id: string;
  config: PageConfig;
}) {
  const { data, titleId, title, links = [], variants = [] } = config;
  const W = data.width;
  const p = place(W);
  const u = (v: number) => `calc(${v} * 100cqw / ${W})`;
  const scope = `[data-fp="${id}"]`;
  const css = links
    .map((l, i) => {
      if (!l.hover) return "";
      const v = variants[l.hover.variant];
      const [x, y, w, h] = union(v.data, l.hover.ids, l.pad);
      const t = `${scope} [data-t="${i}"]`;
      return (
        `${scope}:has([data-t="${i}"]:is(:hover, :focus-visible)) [data-v="${l.hover.variant}"]{opacity:1}` +
        // O estilo inline define as variáveis da base; no hover, a área cresce para a da variação.
        `${t}:hover{--x:${x}!important;--y:${y + (v.dy ?? 0)}!important;--w:${w}!important;--h:${h}!important}`
      );
    })
    .join("");

  return (
    <div data-fp={id} className="cv overflow-y-clip">
      {!titleId && title && <h1 className="sr-only">{title}</h1>}
      <FigmaCanvas data={data} opts={{ titleId }} />
      {variants.map((v, i) => (
        <div
          key={i}
          data-v={i}
          aria-hidden
          inert
          className="pointer-events-none absolute inset-x-0 top-0 opacity-0 transition-opacity duration-300 motion-reduce:transition-none"
          style={{
            translate: v.dy ? `0 ${u(v.dy)}` : undefined,
            clipPath: v.clip
              ? `inset(${u(v.clip[0])} 0 ${v.clip[1] != null ? `calc(100% - ${u(v.clip[1])})` : "0"} 0)`
              : undefined,
          }}
        >
          <FigmaCanvas data={v.data} />
        </div>
      ))}
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
