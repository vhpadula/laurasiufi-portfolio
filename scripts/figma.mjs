#!/usr/bin/env node
// Lê o Figma pela API REST. Uso:
//   node scripts/figma.mjs listar
//   node scripts/figma.mjs baixar <node-id> <slug> [escala=2]   (frames altos: 1, o Figma reduz exports > ~32 MP)
//   node scripts/figma.mjs importar <figma-export.zip>   (zip do figma-plugin/, sem cota)
//   node scripts/figma.mjs comparar <slug> <captura.png> [--escala=1]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, ".figma");
const API = "https://api.figma.com/v1";

function loadEnv() {
  const file = resolve(ROOT, ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

const TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = process.env.FIGMA_FILE_KEY || "fvtDPNnt1mbHHDqjDto1hr";

const normId = (id) => id.replace(/-/g, ":");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function req(path, { binary = false } = {}) {
  const url = path.startsWith("http") ? path : API + path;
  const headers = path.startsWith("http") ? {} : { "X-Figma-Token": TOKEN };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers });
    if (res.status === 429 && attempt <= 5) {
      const wait = Number(res.headers.get("retry-after")) * 1000 || 2000 * 2 ** attempt;
      if (wait > 5 * 60_000) {
        const tier = res.headers.get("x-figma-plan-tier") ?? "?";
        const type = res.headers.get("x-figma-rate-limit-type") ?? "?";
        throw new Error(
          `Cota da API esgotada (429, plano ${tier}, limite ${type}): o Figma pede ` +
            `${Math.round(wait / 3_600_000)}h de espera. Abortando.`,
        );
      }
      console.error(`429 — aguardando ${Math.round(wait / 1000)}s (tentativa ${attempt}/5)`);
      await sleep(wait);
      continue;
    }
    if (res.status === 403 || res.status === 401) {
      throw new Error(
        `Acesso negado (${res.status}). Verifique se o token é válido, tem escopo de leitura ` +
          `de arquivo e se sua conta tem acesso ao arquivo ${FILE_KEY}.`,
      );
    }
    if (res.status === 404) throw new Error(`Não encontrado (404): ${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return binary ? Buffer.from(await res.arrayBuffer()) : res.json();
  }
}

// ---------- listar ----------
async function listar() {
  const file = await req(`/files/${FILE_KEY}?depth=2`);
  console.log(`Arquivo: ${file.name}\n`);
  for (const page of file.document.children) {
    console.log(`## Página: ${page.name} (${page.id})`);
    for (const f of page.children ?? []) {
      if (f.visible === false) continue;
      const b = f.absoluteBoundingBox;
      const size = b ? `${Math.round(b.width)}×${Math.round(b.height)}` : "-";
      console.log(`  ${f.type.padEnd(10)} ${f.id.padEnd(10)} ${size.padEnd(11)} ${f.name}`);
    }
    console.log();
  }
}

// ---------- baixar ----------
const r = (n) => Math.round(n * 100) / 100;
const hex = (c, opacity = 1) => {
  const h = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
  const a = r((c.a ?? 1) * opacity);
  return `#${h(c.r)}${h(c.g)}${h(c.b)}${a < 1 ? ` @${a}` : ""}`;
};

function paints(list) {
  return (list ?? [])
    .filter((p) => p.visible !== false)
    .map((p) => {
      if (p.type === "SOLID") return hex(p.color, p.opacity ?? 1);
      if (p.type === "IMAGE") return `IMAGE(${p.imageRef}, ${p.scaleMode})`;
      if (p.type.startsWith("GRADIENT"))
        return `${p.type}(${p.gradientStops.map((s) => `${hex(s.color)} ${r(s.position * 100)}%`).join(", ")})`;
      return p.type;
    });
}

function describe(node, frameBox, depth) {
  const pad = "  ".repeat(depth);
  const b = node.absoluteBoundingBox;
  const parts = [`${pad}- **${node.type}** \`${node.id}\` "${node.name}"`];
  if (b) parts.push(`x${r(b.x - frameBox.x)} y${r(b.y - frameBox.y)} ${r(b.width)}×${r(b.height)}`);
  const lines = [parts.join(" — ")];
  const attr = [];

  if (node.layoutMode && node.layoutMode !== "NONE") {
    attr.push(
      `layout ${node.layoutMode} gap ${node.itemSpacing ?? 0} ` +
        `pad ${node.paddingTop ?? 0}/${node.paddingRight ?? 0}/${node.paddingBottom ?? 0}/${node.paddingLeft ?? 0} ` +
        `align ${node.primaryAxisAlignItems ?? "MIN"}/${node.counterAxisAlignItems ?? "MIN"}` +
        (node.layoutWrap === "WRAP" ? " wrap" : ""),
    );
  }
  if (node.layoutSizingHorizontal || node.layoutSizingVertical)
    attr.push(`sizing ${node.layoutSizingHorizontal ?? "-"}/${node.layoutSizingVertical ?? "-"}`);
  if (node.layoutPositioning === "ABSOLUTE") attr.push("position ABSOLUTE");

  const fills = paints(node.fills);
  if (fills.length) attr.push(`${node.type === "TEXT" ? "color" : "fill"} ${fills.join(" + ")}`);
  const strokes = paints(node.strokes);
  if (strokes.length)
    attr.push(`stroke ${strokes.join(" + ")} ${node.strokeWeight ?? 1}px ${node.strokeAlign ?? ""}`.trim());
  if (node.rectangleCornerRadii) attr.push(`radius ${node.rectangleCornerRadii.join("/")}`);
  else if (node.cornerRadius) attr.push(`radius ${node.cornerRadius}`);
  if (node.opacity != null && node.opacity < 1) attr.push(`opacity ${r(node.opacity)}`);
  for (const e of (node.effects ?? []).filter((e) => e.visible !== false)) {
    attr.push(
      `${e.type} ${e.offset ? `${e.offset.x},${e.offset.y} ` : ""}blur ${e.radius}` +
        `${e.spread ? ` spread ${e.spread}` : ""}${e.color ? ` ${hex(e.color)}` : ""}`,
    );
  }
  if (node.clipsContent) attr.push("clip");

  if (node.type === "TEXT") {
    const s = node.style ?? {};
    const lh = s.lineHeightUnit === "INTRINSIC_%" ? "auto" : `${r(s.lineHeightPx)}px`;
    attr.push(
      `font ${s.fontFamily} ${s.fontWeight}${s.italic ? " italic" : ""} ${s.fontSize}px ` +
        `lh ${lh} ls ${r(s.letterSpacing ?? 0)}px align ${s.textAlignHorizontal ?? "LEFT"}` +
        (s.textCase && s.textCase !== "ORIGINAL" ? ` case ${s.textCase}` : "") +
        (s.textDecoration && s.textDecoration !== "NONE" ? ` ${s.textDecoration}` : "") +
        (s.textAutoResize ? ` resize ${s.textAutoResize}` : ""),
    );
    const overrides = Object.values(node.styleOverrideTable ?? {});
    for (const o of overrides) {
      attr.push(
        `override ${[o.fontFamily, o.fontWeight, o.fontSize && `${o.fontSize}px`, o.fills && paints(o.fills).join("+"), o.textDecoration]
          .filter(Boolean)
          .join(" ")}`,
      );
    }
  }
  if (attr.length) lines.push(`${pad}  ${attr.join(" · ")}`);
  if (node.type === "TEXT") lines.push(`${pad}  > ${JSON.stringify(node.characters)}`);
  return lines;
}

function walk(node, frameBox, depth, out) {
  if (node.visible === false) return;
  out.push(...describe(node, frameBox, depth));
  for (const c of node.children ?? []) walk(c, frameBox, depth + 1, out);
}

async function baixar(rawId, slug, scale = "2") {
  if (!rawId || !slug) throw new Error("uso: baixar <node-id> <slug>");
  const id = normId(rawId);
  mkdirSync(OUT, { recursive: true });

  // A cota de /nodes é pequena no plano Starter: reaproveita a árvore salva (FIGMA_REFRESH=1 força).
  const jsonPath = resolve(OUT, `${slug}.json`);
  let node;
  if (existsSync(jsonPath) && !process.env.FIGMA_REFRESH) {
    node = JSON.parse(readFileSync(jsonPath, "utf8"));
  } else {
    const data = await req(`/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(id)}&geometry=paths`);
    node = data.nodes[id]?.document;
    if (!node) throw new Error(`Nó ${id} não encontrado`);
    writeFileSync(jsonPath, JSON.stringify(node, null, 2));
  }

  const img = await req(`/images/${FILE_KEY}?ids=${encodeURIComponent(id)}&scale=${scale}&format=png`);
  if (img.err || !img.images?.[id]) throw new Error(`Falha ao exportar PNG: ${img.err ?? "sem URL"}`);
  writeFileSync(resolve(OUT, `${slug}.png`), await req(img.images[id], { binary: true }));

  writeMd(node, slug);
}

function writeMd(node, slug) {
  const box = node.absoluteBoundingBox;
  const render = node.absoluteRenderBounds ?? box;
  const md = [
    `# ${node.name} (\`${node.id}\`)`,
    ``,
    `Frame ${r(box.width)}×${r(box.height)} · render bounds ${r(render.width)}×${r(render.height)} ` +
      `(offset ${r(box.x - render.x)},${r(box.y - render.y)})`,
    ``,
  ];
  walk(node, box, 0, md);
  writeFileSync(resolve(OUT, `${slug}.md`), md.join("\n") + "\n");
  console.log(`.figma/${slug}.{json,png,md} — ${r(box.width)}×${r(box.height)}`);
}

// ---------- importar ----------
// Lê o zip gerado por figma-plugin/ (sem cota de API) e grava no mesmo formato do `baixar`.
const SLUGS = {
  "49:22": "home",
  "15:171": "home-hover-about",
  "51:107": "home-hover-tutti",
  "53:166": "home-hover-itau",
  "53:224": "home-hover-trama",
  "15:224": "about",
  "49:77": "about-hover-work",
  "18:5": "itau",
  "29:33550": "trama",
  "47:22": "tuttifree",
};

async function importar(zipPath) {
  if (!zipPath) throw new Error("uso: importar <figma-export.zip>");
  const { execFileSync } = await import("node:child_process");
  const { readdirSync, renameSync, rmSync } = await import("node:fs");
  const tmp = resolve(OUT, "import");
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  execFileSync("unzip", ["-q", "-o", resolve(zipPath), "-d", tmp]);
  for (const dir of ["svg", "img"]) {
    mkdirSync(resolve(OUT, dir), { recursive: true });
    const src = resolve(tmp, dir);
    for (const f of existsSync(src) ? readdirSync(src, { withFileTypes: true }).filter((d) => d.isFile()) : [])
      renameSync(resolve(src, f.name), resolve(OUT, dir, f.name));
  }
  for (const f of readdirSync(tmp).filter((f) => f.endsWith(".json"))) {
    const node = JSON.parse(readFileSync(resolve(tmp, f), "utf8"));
    const slug = SLUGS[node.id] ?? node.name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    renameSync(resolve(tmp, f), resolve(OUT, `${slug}.json`));
    const png = resolve(tmp, f.replace(/\.json$/, ".png"));
    if (existsSync(png)) renameSync(png, resolve(OUT, `${slug}.png`));
    writeMd(node, slug);
  }
  rmSync(tmp, { recursive: true, force: true });
}

// ---------- comparar ----------
async function comparar(slug, capturePath, ...opts) {
  if (!slug || !capturePath) throw new Error("uso: comparar <slug> <captura.png>");
  const { PNG } = await import("pngjs");
  const pixelmatch = (await import("pixelmatch")).default;
  const node = JSON.parse(readFileSync(resolve(OUT, `${slug}.json`), "utf8"));
  const box = node.absoluteBoundingBox;
  const render = node.absoluteRenderBounds ?? box;

  let fig = PNG.sync.read(readFileSync(resolve(OUT, `${slug}.png`)));
  let cap = PNG.sync.read(readFileSync(resolve(capturePath)));

  // O Figma reduz exports acima de ~32 MP, então a escala real pode não ser a pedida:
  // mede pelo PNG e, se a captura estiver em outra escala, reamostra para a mesma.
  // --escala=1 leva Figma e captura para 1x: tira o ruído de textura que sobra quando
  // o export já veio reduzido (as duas imagens passaram por reamostragens diferentes).
  const target = Number(opts.find((o) => o.startsWith("--escala="))?.slice(9)) || null;
  let SCALE = fig.width / render.width;
  if (target && Math.abs(SCALE - target) > 0.001) {
    fig = resample(PNG, fig, target / SCALE);
    SCALE = target;
  }
  const capScale = cap.width / box.width;
  if (Math.abs(SCALE - capScale) > 0.001) {
    console.warn(`Export do Figma em ${SCALE.toFixed(4)}x, captura em ${capScale.toFixed(4)}x; reamostrando a captura`);
    cap = resample(PNG, cap, SCALE / capScale);
  }
  writeFileSync(resolve(OUT, `${slug}.cap.png`), PNG.sync.write(cap));
  writeFileSync(resolve(OUT, `${slug}.ref.png`), PNG.sync.write(fig));

  // O export cobre os render bounds (sombras podem aumentá-lo); recorta no frame.
  const ox = Math.max(0, Math.round((box.x - render.x) * SCALE));
  const oy = Math.max(0, Math.round((box.y - render.y) * SCALE));
  const fw = Math.min(Math.round(box.width * SCALE), fig.width - ox);
  const fh = Math.min(Math.round(box.height * SCALE), fig.height - oy);
  const ref = new PNG({ width: fw, height: fh });
  PNG.bitblt(fig, ref, ox, oy, fw, fh, 0, 0);

  if (Math.abs(cap.width - fw) > 1) console.warn(`Aviso: largura da captura ${r(cap.width / SCALE)} ≠ frame ${r(box.width)} CSS px`);
  if (Math.abs(cap.height - fh) > 1) console.warn(`Aviso: altura da captura ${r(cap.height / SCALE)} ≠ frame ${r(box.height)} CSS px`);
  const w = Math.min(fw, cap.width);
  const h = Math.min(fh, cap.height);
  const crop = (src) => {
    const p = new PNG({ width: w, height: h });
    PNG.bitblt(src, p, 0, 0, w, h, 0, 0);
    return p;
  };
  const a = crop(ref);
  const b = crop(cap);
  const diff = new PNG({ width: w, height: h });
  const total = pixelmatch(a.data, b.data, diff.data, w, h, { threshold: 0.1 });
  const diffPath = resolve(OUT, `${slug}.diff.png`);
  writeFileSync(diffPath, PNG.sync.write(diff));

  // Áreas de foto (nós com preenchimento IMAGE): Figma e Chrome reamostram com filtros
  // diferentes, então textura nunca bate pixel a pixel. O % "sem fotos" isola o layout.
  const photos = [];
  (function collect(n) {
    if (n.visible === false) return;
    if ((n.fills ?? []).some((f) => f.type === "IMAGE" && f.visible !== false) && n.absoluteBoundingBox) {
      const b = n.absoluteBoundingBox;
      photos.push([(b.x - box.x) * SCALE, (b.y - box.y) * SCALE, (b.x - box.x + b.width) * SCALE, (b.y - box.y + b.height) * SCALE]);
    }
    for (const c of n.children ?? []) collect(c);
  })(node);
  const inPhoto = (x, y) => photos.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1);

  const bands = [];
  for (let css = 0; css * SCALE < h; css += 50) {
    const y0 = Math.round(css * SCALE);
    const y1 = Math.min(h, Math.round((css + 50) * SCALE));
    let n = 0;
    let np = 0;
    for (let y = y0; y < y1; y++)
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        // pixelmatch pinta diferenças de vermelho (255,0,0); antialiasing sai em amarelo e não conta
        if (diff.data[i] === 255 && diff.data[i + 1] === 0 && diff.data[i + 2] === 0) {
          n++;
          if (!inPhoto(x, y)) np++;
        }
      }
    bands.push({ y: css, pct: (n / ((y1 - y0) * w)) * 100, layout: (np / ((y1 - y0) * w)) * 100 });
  }

  console.log(`Diferença total: ${r((total / (w * h)) * 100)}%  (diff: .figma/${slug}.diff.png)`);
  const over = (k) => bands.filter((b) => b[k] > 0.5).length;
  console.log(`Faixas acima de 0,5%: ${over("pct")}/${bands.length} · sem fotos: ${over("layout")}/${bands.length}`);
  console.log("  faixa            total   sem fotos");
  for (const b of [...bands].sort((x, y) => y.layout - x.layout).slice(0, 10))
    console.log(`  y ${String(b.y).padStart(5)}–${b.y + 50}px  ${b.pct.toFixed(2).padStart(6)}%  ${b.layout.toFixed(2).padStart(6)}%`);
  writeFileSync(resolve(OUT, `${slug}.bands.json`), JSON.stringify(bands, null, 2));
}

// Reamostragem bilinear (o fator aqui é sempre próximo de 1 ou menor).
function resample(PNG, src, f) {
  const out = new PNG({ width: Math.round(src.width * f), height: Math.round(src.height * f) });
  for (let y = 0; y < out.height; y++) {
    const sy = Math.min(src.height - 1, (y + 0.5) / f - 0.5);
    const y0 = Math.max(0, Math.floor(sy)), y1 = Math.min(src.height - 1, y0 + 1), fy = Math.max(0, sy - y0);
    for (let x = 0; x < out.width; x++) {
      const sx = Math.min(src.width - 1, (x + 0.5) / f - 0.5);
      const x0 = Math.max(0, Math.floor(sx)), x1 = Math.min(src.width - 1, x0 + 1), fx = Math.max(0, sx - x0);
      for (let c = 0; c < 4; c++) {
        const p = (yy, xx) => src.data[(yy * src.width + xx) * 4 + c];
        const top = p(y0, x0) * (1 - fx) + p(y0, x1) * fx;
        const bot = p(y1, x0) * (1 - fx) + p(y1, x1) * fx;
        out.data[(y * out.width + x) * 4 + c] = Math.round(top * (1 - fy) + bot * fy);
      }
    }
  }
  return out;
}

// ---------- main ----------
const [cmd, ...args] = process.argv.slice(2);
const cmds = { listar, baixar, importar, comparar };
if (!cmds[cmd]) {
  console.error("comandos: listar | baixar <node-id> <slug> | importar <zip> | comparar <slug> <captura.png>");
  process.exit(1);
}
if (!["comparar", "importar"].includes(cmd) && !TOKEN) {
  console.error("FIGMA_TOKEN ausente em .env.local");
  process.exit(1);
}
cmds[cmd](...args).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
