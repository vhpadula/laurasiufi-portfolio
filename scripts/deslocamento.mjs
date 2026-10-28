#!/usr/bin/env node
// Mede o deslocamento vertical entre o Figma e a captura em regiões (px do Figma). Uso:
//   node scripts/deslocamento.mjs <slug> <captura.png> x0,y0,x1,y1 [...]
// Para diagnóstico: se "dy" for diferente de 0, o conteúdo da captura está dy px abaixo.
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const [slug, cap, ...rs] = process.argv.slice(2);
const f = PNG.sync.read(readFileSync(`.figma/${slug}.png`)),
  c = PNG.sync.read(readFileSync(cap));
const kf = f.width / 1440,
  kc = c.width / 1440;
const L = (img, k, x, y) => {
  const i = (Math.round(y * k) * img.width + Math.round(x * k)) * 4;
  return img.data[i] * 0.3 + img.data[i + 1] * 0.59 + img.data[i + 2] * 0.11;
};
for (const r of rs) {
  const [x0, y0, x1, y1] = r.split(",").map(Number);
  const err = (dx, dy) => {
    let s = 0,
      m = 0;
    for (let y = y0; y < y1; y += 0.5)
      for (let x = x0; x < x1; x += 0.5) {
        s += Math.abs(L(f, kf, x, y) - L(c, kc, x + dx, y + dy));
        m++;
      }
    return s / m;
  };
  let best = [1e9];
  for (let dy = -20; dy <= 20; dy += 0.5) {
    const e = err(0, dy);
    if (e < best[0]) best = [e, dy];
  }
  console.log(
    r,
    "erro",
    err(0, 0).toFixed(2),
    "→",
    best[0].toFixed(2),
    "dy",
    best[1],
  );
}
