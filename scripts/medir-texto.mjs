#!/usr/bin/env node
// Mede, para cada texto de um case, o deslocamento vertical da 1ª linha entre o Figma e a captura e
// agrega por família/tamanho. Uso: node scripts/medir-texto.mjs <slug> <captura.png>
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";

const [slug, capPath] = process.argv.slice(2);
const data = JSON.parse(readFileSync(`src/content/cases/${slug}.json`, "utf8"));
const node = JSON.parse(readFileSync(`.figma/${slug}.json`, "utf8"));
const f = PNG.sync.read(readFileSync(`.figma/${slug}.png`));
const c = PNG.sync.read(readFileSync(capPath));
// Escala de cada imagem e origem da página dentro do PNG do Figma (render bounds da raiz).
const R = node.absoluteRenderBounds ?? node.absoluteBoundingBox;
const B = node.absoluteBoundingBox;
const kf = f.width / R.width;
const kc = c.width / data.width;
const ofx = B.x - R.x - data.offset.x,
  ofy = B.y - R.y - data.offset.y;

const L = (img, k, x, y, ox = 0, oy = 0) => {
  const px = Math.round((x + ox) * k),
    py = Math.round((y + oy) * k);
  if (px < 0 || py < 0 || px >= img.width || py >= img.height) return 255;
  const i = (py * img.width + px) * 4;
  return img.data[i] * 0.3 + img.data[i + 1] * 0.59 + img.data[i + 2] * 0.11;
};

const out = {};
(function walk(list, ox, oy) {
  for (const n of list) {
    if (n.k === "group") {
      walk(n.children, ox, oy);
      continue;
    }
    if (n.k === "frame") walk(n.children ?? [], ox + n.x, oy + n.y);
    if (n.k !== "text" || n.m) continue;
    const st = n.runs[0].style;
    const lh = st.lh ?? st.size * 1.3;
    const x0 = ox + n.x + data.offset.x,
      y0 = oy + n.y + data.offset.y;
    const w = Math.min(n.w, 500),
      h = Math.min(lh, 120);
    const err = (dy) => {
      let s = 0,
        m = 0;
      for (let y = 0; y < h; y += 0.5)
        for (let x = 0; x < w; x += 0.5) {
          s += Math.abs(
            L(f, kf, x0 + x, y0 + y, ofx - data.offset.x, ofy - data.offset.y) -
              L(c, kc, x0 + x - data.offset.x, y0 + y - data.offset.y + dy),
          );
          m++;
        }
      return s / m;
    };
    let best = [Infinity, 0];
    for (let dy = -16; dy <= 16; dy += 0.5) {
      const e = err(dy);
      if (e < best[0]) best = [e, dy];
    }
    const e0 = err(0);
    if (e0 < 1.5 && best[1] === 0) {
      (out[`${st.family} ${st.size}`] ??= []).push(0);
      continue;
    }
    if (best[0] > e0 * 0.6) continue; // sem ganho claro: provavelmente texto sobre foto ou outra causa
    (out[`${st.family} ${st.size}`] ??= []).push(best[1]);
  }
})(data.nodes, 0, 0);

for (const [k, v] of Object.entries(out).sort()) {
  const s = [...v].sort((a, b) => a - b);
  console.log(
    `${k.padEnd(24)} n=${String(v.length).padStart(3)}  mediana dy ${s[Math.floor(s.length / 2)]}  (min ${s[0]}, max ${s[s.length - 1]})`,
  );
}
