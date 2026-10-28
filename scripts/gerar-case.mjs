#!/usr/bin/env node
// Gera os dados de uma página de case a partir da árvore exportada do Figma. Uso:
//   node scripts/gerar-case.mjs <slug> [node-id da página]
// Lê .figma/<slug>.json (+ .figma/img, .figma/svg) e escreve src/content/cases/<slug>.json,
// copiando para public/images/cases/<slug>/ só as imagens e SVGs usados. A página visível é o
// frame <node-id> (padrão: a raiz); o resto da árvore é posicionado relativo a ele.
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIG = resolve(ROOT, ".figma");
const [slug, pageId] = process.argv.slice(2);
if (!slug) {
  console.error("uso: gerar-case.mjs <slug> [node-id da página]");
  process.exit(1);
}

const tree = JSON.parse(readFileSync(resolve(FIG, `${slug}.json`), "utf8"));
const outImg = resolve(ROOT, "public/images/cases", slug);
mkdirSync(outImg, { recursive: true });
const publicPath = `/images/cases/${slug}`;
const imgFiles = Object.fromEntries(
  readdirSync(resolve(FIG, "img")).map((f) => [f.split(".")[0], f]),
);

const r2 = (n) => Math.round(n * 100) / 100;
const isVector = (n) =>
  ["VECTOR", "BOOLEAN_OPERATION", "STAR", "POLYGON"].includes(n.type);
const isFrame = (n) => ["FRAME", "INSTANCE", "COMPONENT"].includes(n.type);

function color(c, opacity = 1) {
  const a = r2((c.a ?? 1) * opacity);
  const h = (v) => Math.round(v * 255);
  return a < 1
    ? `rgb(${h(c.r)} ${h(c.g)} ${h(c.b)} / ${a})`
    : `#${[c.r, c.g, c.b].map((v) => h(v).toString(16).padStart(2, "0")).join("")}`;
}

const used = { img: new Set(), svg: new Set() };

/** Preenchimentos: cores/gradientes viram um `background` CSS; imagens viram `{ src, mode, crop }`. */
function fills(list) {
  const layers = [];
  let image = null;
  for (const p of (list ?? []).filter((p) => p.visible !== false)) {
    if (p.type === "SOLID") layers.push(color(p.color, p.opacity ?? 1));
    else if (p.type === "GRADIENT_LINEAR") {
      // Sem gradientTransform no export: assume de cima para baixo (conferir no diff).
      const stops = p.gradientStops.map(
        (s) => `${color(s.color, p.opacity ?? 1)} ${r2(s.position * 100)}%`,
      );
      layers.push(`linear-gradient(180deg, ${stops.join(", ")})`);
    } else if (p.type === "IMAGE" && imgFiles[p.imageRef]) {
      used.img.add(imgFiles[p.imageRef]);
      image = {
        src: `${publicPath}/${imgFiles[p.imageRef]}`,
        mode: p.scaleMode,
        opacity: p.opacity ?? 1,
      };
      if (p.scaleMode === "CROP" && p.imageTransform)
        image.crop = p.imageTransform.flat().map((v) => +v.toFixed(5));
    }
  }
  // CSS empilha o primeiro por cima; o Figma, o último. Cores sólidas viram gradientes de uma cor.
  const bg = layers
    .reverse()
    .map((l, i, all) =>
      l.startsWith("linear") || all.length === 1
        ? l
        : `linear-gradient(${l}, ${l})`,
    );
  return { bg: bg.length ? bg.join(", ") : undefined, image };
}

function effects(list, inner) {
  const out = (list ?? [])
    .filter(
      (e) =>
        e.visible !== false &&
        (e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW"),
    )
    .map((e) => ({
      inset: e.type === "INNER_SHADOW",
      x: r2(e.offset?.x ?? 0),
      y: r2(e.offset?.y ?? 0),
      blur: r2(e.radius ?? 0),
      spread: r2(e.spread ?? 0),
      color: color(e.color),
    }));
  return out.length ? out : inner;
}

function textStyle(s, fillsList) {
  return {
    family: s.fontFamily,
    weight: s.fontWeight,
    italic: s.italic || undefined,
    size: s.fontSize,
    lh:
      s.lineHeightUnit === "INTRINSIC_%" || s.lineHeightPx == null
        ? undefined
        : r2(s.lineHeightPx),
    ls: s.letterSpacing ? r2(s.letterSpacing) : undefined,
    case: s.textCase && s.textCase !== "ORIGINAL" ? s.textCase : undefined,
    deco:
      s.textDecoration && s.textDecoration !== "NONE"
        ? s.textDecoration
        : undefined,
    color: fills(fillsList).bg,
  };
}

/**
 * Converte um nó. Coordenadas são locais ao frame que o contém (o relativeTransform do Figma já é
 * relativo ao frame, mesmo para filhos de grupos — conferido nos 3 cases). Grupos não viram elemento.
 */
function convert(n, frameAbs) {
  if (n.visible === false) return [];
  if (n.type !== "GROUP" && !n.relativeTransform) return [];

  if (n.type === "GROUP") {
    const kids = (n.children ?? []).flatMap((c) => convert(c, frameAbs));
    return n.opacity != null && n.opacity < 1
      ? [{ k: "group", opacity: r2(n.opacity), children: kids }]
      : kids;
  }

  const [[a, c, tx], [b, d, ty]] = n.relativeTransform;
  const rotated = Math.abs(c) > 1e-6 || Math.abs(b) > 1e-6 || a < 0;
  const base = { id: n.id, name: n.name };
  if (n.opacity != null && n.opacity < 1) base.opacity = r2(n.opacity);

  // Vetores: SVG exportado pelo Figma, que já vem girado e com efeitos, nos render bounds.
  if (isVector(n)) {
    const rb = n.absoluteRenderBounds;
    const file = `${n.id.replace(/[:;]/g, "-")}.svg`;
    if (!rb || !existsSync(resolve(FIG, "svg", file))) return [];
    used.svg.add(file);
    return [
      {
        ...base,
        k: "svg",
        x: r2(rb.x - frameAbs.x),
        y: r2(rb.y - frameAbs.y),
        w: r2(rb.width),
        h: r2(rb.height),
        src: `${publicPath}/svg/${file}`,
      },
    ];
  }

  const node = {
    ...base,
    x: r2(tx),
    y: r2(ty),
    w: r2(n.size.x),
    h: r2(n.size.y),
  };
  if (rotated) node.m = [a, b, c, d].map((v) => +v.toFixed(5));

  if (n.type === "LINE") {
    const stroke = fills(n.strokes).bg;
    if (!stroke) return [];
    return [
      {
        ...node,
        k: "line",
        h: undefined,
        weight: n.strokeWeight,
        color: stroke,
        round: n.strokeCap === "ROUND" || undefined,
      },
    ];
  }

  if (n.type === "TEXT") {
    const segs = Object.values(n.styleOverrideTable ?? {});
    const runs = [];
    // Primeiro trecho (estilo base) vai até o início do primeiro override.
    const firstEnd = segs.length ? segs[0].start : n.characters.length;
    runs.push({
      text: n.characters.slice(0, firstEnd),
      style: textStyle(n.style, n.fills),
    });
    for (const s of segs)
      runs.push({
        text: n.characters.slice(s.start, s.end),
        style: textStyle(s, s.fills),
      });
    return [
      {
        ...node,
        k: "text",
        align: n.style.textAlignHorizontal,
        valign: n.style.textAlignVertical,
        resize: n.style.textAutoResize,
        shadow: effects(n.effects),
        runs: runs.filter((r) => r.text.length),
      },
    ];
  }

  // Retângulos, elipses e frames.
  const f = fills(n.fills);
  if (f.bg) node.bg = f.bg;
  if (f.image) node.image = f.image;
  const stroke = fills(n.strokes).bg;
  if (stroke && n.strokeWeight)
    node.border = { w: n.strokeWeight, color: stroke, align: n.strokeAlign };
  if (n.type === "ELLIPSE") node.radius = "50%";
  else if (n.rectangleCornerRadii) node.radius = n.rectangleCornerRadii;
  else if (n.cornerRadius) node.radius = n.cornerRadius;
  const shadow = effects(n.effects);
  if (shadow) node.shadow = shadow;

  if (isFrame(n)) {
    node.k = "frame";
    if (n.clipsContent) node.clip = true;
    node.children = (n.children ?? []).flatMap((ch) =>
      convert(ch, n.absoluteBoundingBox),
    );
  } else node.k = "box";
  if (
    !node.bg &&
    !node.image &&
    !node.border &&
    !node.shadow &&
    node.k === "box"
  )
    return [];
  return [node];
}

// Página visível: o frame indicado (Itaú/Trama têm um frame de 1440 dentro de um maior).
function find(n, id) {
  if (n.id === id) return n;
  for (const c of n.children ?? []) {
    const f = find(c, id);
    if (f) return f;
  }
}
const page = pageId ? find(tree, pageId.replace(/-/g, ":")) : tree;
if (!page) throw new Error(`Nó ${pageId} não encontrado`);
const P = page.absoluteBoundingBox;
const R = tree.absoluteBoundingBox;
// A raiz é desenhada deslocada para a página começar em (0, 0).
const rootChildren = (tree.children ?? []).flatMap((c) => convert(c, R));
const data = {
  slug,
  source: tree.id,
  page: page.id,
  width: r2(P.width),
  height: r2(P.height),
  offset: { x: r2(R.x - P.x), y: r2(R.y - P.y) },
  bg: fills(tree.fills).bg ?? fills(page.fills).bg,
  nodes: rootChildren,
};

mkdirSync(resolve(outImg, "svg"), { recursive: true });
for (const f of used.img)
  copyFileSync(resolve(FIG, "img", f), resolve(outImg, f));
for (const f of used.svg)
  copyFileSync(resolve(FIG, "svg", f), resolve(outImg, "svg", f));
mkdirSync(resolve(ROOT, "src/content/cases"), { recursive: true });
writeFileSync(
  resolve(ROOT, "src/content/cases", `${slug}.json`),
  JSON.stringify(data),
);

let count = 0;
(function walk(list) {
  for (const n of list) {
    count++;
    walk(n.children ?? []);
  }
})(data.nodes);
console.log(
  `src/content/cases/${slug}.json — ${count} nós · ${used.img.size} imagens · ${used.svg.size} SVGs · página ${data.width}×${data.height}`,
);
