#!/usr/bin/env node
// Compara a largura dos textos de largura automática (WIDTH_AND_HEIGHT) no navegador com a caixa do
// Figma — que, nesse modo, é exatamente a largura do texto — e agrega a razão por família/peso.
// Uso: node scripts/medir-largura.mjs <slug> [...]   (com o next dev rodando)
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch();
const acc = {};
for (const slug of process.argv.slice(2)) {
  const data = JSON.parse(
    readFileSync(`src/content/cases/${slug}.json`, "utf8"),
  );
  const want = {};
  (function walk(list) {
    for (const n of list) {
      if (n.k === "group" || n.k === "frame") walk(n.children ?? []);
      if (
        n.k === "text" &&
        n.resize === "WIDTH_AND_HEIGHT" &&
        n.runs.length === 1 &&
        !n.m
      )
        want[n.id] = n;
    }
  })(data.nodes);
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(`${base}/work/${slug}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const widths = await page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll("[data-node]")].map((e) => [
        e.dataset.node,
        e.getBoundingClientRect().width,
      ]),
    ),
  );
  for (const [id, n] of Object.entries(want)) {
    if (!(id in widths) || n.w < 40) continue;
    const st = n.runs[0].style;
    // CSS soma o letterSpacing depois do último caractere; o Figma não.
    const w = widths[id] - (st.ls ?? 0);
    (acc[`${st.family} ${st.weight}`] ??= []).push(w / n.w);
  }
  await page.close();
}
await browser.close();
for (const [k, v] of Object.entries(acc).sort()) {
  const s = [...v].sort((a, b) => a - b);
  console.log(
    `${k.padEnd(22)} n=${String(v.length).padStart(3)}  navegador/Figma mediana ${s[Math.floor(s.length / 2)].toFixed(4)} (min ${s[0].toFixed(3)}, max ${s[s.length - 1].toFixed(3)})`,
  );
}
