import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CroppedImage } from "./CroppedImage";
import { place } from "@/lib/place";

// Renderiza os dados gerados por scripts/gerar-case.mjs a partir da árvore do Figma. Usa o mesmo
// canvas da home/About: cada frame é um container e os filhos ficam em px do Figma (ver .cv/.abs).

type Shadow = {
  inset: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
};
type Run = {
  text: string;
  style: {
    family: string;
    weight: number;
    italic?: boolean;
    size: number;
    lh?: number;
    ls?: number;
    case?: string;
    deco?: string;
    color?: string;
  };
};
type ImageFill = {
  src: string;
  mode: string;
  opacity: number;
  crop?: number[];
};
type Base = {
  id?: string;
  name?: string;
  x: number;
  y: number;
  w: number;
  h?: number;
  m?: number[];
  opacity?: number;
};
export type CaseNode =
  | (Base & {
      k: "box" | "frame";
      h: number;
      bg?: string;
      image?: ImageFill;
      border?: { w: number; color: string; align: string };
      radius?: number | number[] | string;
      shadow?: Shadow[];
      clip?: boolean;
      children?: CaseNode[];
    })
  | (Base & { k: "svg"; h: number; src: string })
  | (Base & { k: "line"; weight: number; color: string; round?: boolean })
  | (Base & {
      k: "text";
      h: number;
      align: string;
      valign: string;
      resize: string;
      shadow?: Shadow[];
      runs: Run[];
    })
  | { k: "group"; opacity: number; children: CaseNode[] };

export type CaseData = {
  slug: string;
  width: number;
  height: number;
  offset: { x: number; y: number };
  bg?: string;
  nodes: CaseNode[];
};

export type CaseOptions = {
  /** Nó de texto que vira o <h1> da página. */
  titleId: string;
  /** Nós que viram links (ex.: "botão voltar" → "/"). */
  links?: Record<string, string>;
};

const FONT: Record<string, string> = {
  Chivo: "var(--nf-chivo)",
  Cinzel: "var(--nf-cinzel)",
  Geologica: "var(--nf-geologica)",
  Georama: "var(--nf-georama)",
  Gruppo: "var(--nf-gruppo)",
  "Holtwood One SC": "var(--nf-holtwood)",
  Jura: "var(--nf-jura)",
  Orbitron: "var(--nf-orbitron)",
  Revalia: "var(--nf-revalia)",
};

/**
 * Deslocamento vertical por família (px do Figma): o Chrome desenha algumas fontes mais alto que o
 * Figma. Medido contra o export, como em `text(…, dy)` (src/lib/place.ts).
 */
const FONT_DY: Record<string, number> = {};

const u = (n: number) => `calc(${n} * var(--u))`;
const shadows = (list: Shadow[]) =>
  list
    .map(
      (s) =>
        `${s.inset ? "inset " : ""}${u(s.x)} ${u(s.y)} ${u(s.blur)} ${u(s.spread)} ${s.color}`,
    )
    .join(", ");
// Em texto o Figma aplica a sombra nos glifos: text-shadow (sem spread nem inset).
const textShadows = (list: Shadow[]) =>
  list
    .filter((s) => !s.inset)
    .map((s) => `${u(s.x)} ${u(s.y)} ${u(s.blur)} ${s.color}`)
    .join(", ") || undefined;
const radius = (r: number | number[] | string) =>
  typeof r === "string" ? r : Array.isArray(r) ? r.map(u).join(" ") : u(r);
const matrix = (m?: number[]) =>
  m ? `matrix(${m[0]}, ${m[1]}, ${m[2]}, ${m[3]}, 0, 0)` : undefined;
const sizes = (w: number, W: number) =>
  `(min-width: 1440px) ${Math.round(w)}px, ${Math.max(1, Math.round((w / W) * 100))}vw`;

function Node({
  n,
  W,
  opts,
}: {
  n: CaseNode;
  W: number;
  opts: CaseOptions;
}): ReactNode {
  const p = place(W);

  if (n.k === "group") {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{ opacity: n.opacity }}
      >
        {n.children.map((c, i) => (
          <Node key={i} n={c} W={W} opts={opts} />
        ))}
      </div>
    );
  }

  const href = n.id ? opts.links?.[n.id] : undefined;
  const transform = matrix(n.m);
  const common: CSSProperties = {
    opacity: n.opacity,
    transform,
    transformOrigin: transform ? "0 0" : undefined,
  };
  let el: ReactNode;

  if (n.k === "svg") {
    el = (
      // eslint-disable-next-line @next/next/no-img-element -- SVG vetorial do Figma, sem otimização a fazer.
      <img
        src={n.src}
        alt=""
        className="abs"
        style={{ ...p(n.x, n.y, n.w, n.h), ...common }}
      />
    );
  } else if (n.k === "line") {
    // O Figma desenha o traço de um lado da linha (y local de −peso a 0); ponta redonda soma meio peso.
    const cap = n.round ? n.weight / 2 : 0;
    el = (
      <span
        className="abs"
        style={{
          ...p(n.x, n.y, n.w + cap * 2, n.weight),
          ...common,
          background: n.color,
          borderRadius: n.round ? u(n.weight / 2) : undefined,
          transform: `${transform ?? ""} translate(${u(-cap)}, ${u(-n.weight)})`,
          transformOrigin: "0 0",
        }}
      />
    );
  } else if (n.k === "text") {
    el = <Text n={n} W={W} opts={opts} common={common} />;
  } else {
    const isFrame = n.k === "frame";
    const style: CSSProperties = {
      ...p(n.x, n.y, n.w, n.h),
      ...common,
      background: n.bg,
      borderRadius: n.radius != null ? radius(n.radius) : undefined,
      boxShadow: n.shadow?.some((s) => !s.inset)
        ? shadows(n.shadow.filter((s) => !s.inset))
        : undefined,
    };
    if (n.border) {
      // Contorno como outline: INSIDE/CENTER/OUTSIDE viram o deslocamento, sem mudar o tamanho da caixa.
      const off =
        n.border.align === "INSIDE"
          ? -n.border.w
          : n.border.align === "CENTER"
            ? -n.border.w / 2
            : 0;
      Object.assign(style, {
        outline: `${u(n.border.w)} solid ${n.border.color}`,
        outlineOffset: u(off),
      });
    }
    const inner = n.shadow?.filter((s) => s.inset);
    el = (
      <div
        className={`abs ${isFrame ? "cv" : ""} ${n.clip || n.image ? "overflow-hidden" : ""}`}
        style={style}
      >
        {n.image && <Fill image={n.image} w={n.w} W={W} />}
        {isFrame &&
          n.children?.map((c, i) => <Node key={i} n={c} W={n.w} opts={opts} />)}
        {/* Sombra interna por cima da imagem (box-shadow inset ficaria por baixo dela). */}
        {inner?.length ? (
          <span
            className="pointer-events-none absolute inset-0"
            style={{ borderRadius: "inherit", boxShadow: shadows(inner) }}
          />
        ) : null}
      </div>
    );
  }

  return href ? (
    <Link href={href} aria-label="Back" className="contents">
      {el}
    </Link>
  ) : (
    el
  );
}

function Fill({ image, w, W }: { image: ImageFill; w: number; W: number }) {
  if (image.mode === "CROP" && image.crop) {
    const [sx, , tx, , sy, ty] = image.crop;
    return (
      <div className="absolute inset-0" style={{ opacity: image.opacity }}>
        <CroppedImage
          src={image.src}
          alt=""
          sizes={sizes(w / Math.min(sx, 1), W)}
          transform={[
            [sx, 0, tx],
            [0, sy, ty],
          ]}
        />
      </div>
    );
  }
  return (
    <Image
      src={image.src}
      alt=""
      fill
      sizes={sizes(w, W)}
      className={image.mode === "FIT" ? "object-contain" : "object-cover"}
      style={{ opacity: image.opacity }}
    />
  );
}

/**
 * Entrelinha "auto" do Figma por família (altura da linha ÷ tamanho). Medida nos textos de linha
 * única dos cases; sem amostra, usa o "normal" do navegador para a fonte.
 */
const AUTO_LH: Record<string, number> = {
  Chivo: 1.4464, // medido no 47:108 (o "normal" do Chivo do Google Fonts é 1,19)
  Cinzel: 1.35,
  Geologica: 1.25,
  Georama: 1.21,
  Gruppo: 0.97,
  "Holtwood One SC": 1.628,
  Jura: 1.19,
  Orbitron: 1.25,
  Revalia: 0.86,
};
const lineHeight = (s: Run["style"]) =>
  s.lh ?? s.size * (AUTO_LH[s.family] ?? 1.2);

/**
 * Quebra os trechos em linhas, como o Figma mede: cada linha tem a altura da maior entrelinha entre
 * os seus caracteres (inclusive o "\n" que a termina). Em CSS isso vira um bloco por linha, sem a
 * "strut" do container nem o alinhamento por baseline entre fontes diferentes.
 */
function toLines(runs: Run[]) {
  type Line = { parts: Run[]; lh: number; style?: Run["style"] };
  const lines: Line[] = [];
  let cur: Line = { parts: [], lh: 0 };
  const grow = (st: Run["style"]) => {
    cur.lh = Math.max(cur.lh, lineHeight(st));
    cur.style ??= st;
  };
  for (const r of runs) {
    r.text
      .replace(/\r/g, "")
      .split("\n")
      .forEach((part, i) => {
        if (i > 0) {
          lines.push(cur);
          cur = { parts: [], lh: 0 };
        }
        if (part) cur.parts.push({ text: part, style: r.style });
        grow(r.style);
      });
  }
  lines.push(cur);
  return lines;
}

function Text({
  n,
  W,
  opts,
  common,
}: {
  n: Extract<CaseNode, { k: "text" }>;
  W: number;
  opts: CaseOptions;
  common: CSSProperties;
}) {
  const p = place(W);
  const first = n.runs[0].style;
  const fixed = n.resize === "NONE" || n.resize === "TRUNCATE";
  const Tag =
    n.id === opts.titleId
      ? "h1"
      : first.size >= 30 && n.runs.length === 1 && n.runs[0].text.length < 90
        ? "h2"
        : "p";
  const dy = FONT_DY[first.family] ?? 0;
  const px = (v: number) => `calc(${+v.toFixed(3)} * 100cqw / ${W})`;
  const style: CSSProperties = {
    ...p(
      n.x,
      n.y,
      n.resize === "WIDTH_AND_HEIGHT" ? undefined : n.w,
      fixed ? n.h : undefined,
    ),
    ...common,
    textAlign:
      n.align === "JUSTIFIED"
        ? "justify"
        : (n.align.toLowerCase() as CSSProperties["textAlign"]),
    whiteSpace: n.resize === "WIDTH_AND_HEIGHT" ? "pre" : "pre-wrap",
    textShadow: n.shadow ? textShadows(n.shadow) : undefined,
    translate: dy ? `0 ${u(dy)}` : undefined,
    display: "flex",
    flexDirection: "column",
    justifyContent:
      fixed && n.valign === "CENTER"
        ? "center"
        : fixed && n.valign === "BOTTOM"
          ? "flex-end"
          : undefined,
  };
  return (
    <Tag className="abs" style={style}>
      {toLines(n.runs).map((line, i) => (
        // O bloco usa a fonte do 1º trecho da linha: a "strut" do CSS fica igual aos glifos e a linha
        // não cresce com o alinhamento por baseline entre fontes diferentes.
        <span
          key={i}
          className="block"
          style={{
            ...(line.style && runStyle(line.style, W)),
            lineHeight: px(line.lh),
            minHeight: px(line.lh),
          }}
        >
          {line.parts.map((r, j) => (
            <span key={j} style={runStyle(r.style, W)}>
              {r.text}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}

function runStyle(s: Run["style"], W: number): CSSProperties {
  return {
    fontFamily: FONT[s.family] ?? s.family,
    fontWeight: s.weight,
    fontStyle: s.italic ? "italic" : undefined,
    fontSize: `calc(${s.size} * 100cqw / ${W})`,
    letterSpacing: s.ls ? `${+(s.ls / s.size).toFixed(4)}em` : undefined,
    textTransform:
      s.case === "UPPER"
        ? "uppercase"
        : s.case === "LOWER"
          ? "lowercase"
          : s.case === "TITLE"
            ? "capitalize"
            : undefined,
    textDecoration:
      s.deco === "UNDERLINE"
        ? "underline"
        : s.deco === "STRIKETHROUGH"
          ? "line-through"
          : undefined,
    color: s.color,
  };
}

/** Página inteira de um case: canvas na largura do frame da página, raiz deslocada pelo offset. */
export function FigmaCanvas({
  data,
  opts,
}: {
  data: CaseData;
  opts: CaseOptions;
}) {
  const p = place(data.width);
  return (
    <div
      className="cv"
      style={{
        aspectRatio: `${data.width} / ${data.height}`,
        background: data.bg,
      }}
    >
      <div
        className="abs"
        style={p(
          data.offset.x,
          data.offset.y,
          data.width - data.offset.x,
          data.height - data.offset.y,
        )}
      >
        {data.nodes.map((n, i) => (
          <Node key={i} n={n} W={data.width} opts={opts} />
        ))}
      </div>
    </div>
  );
}
