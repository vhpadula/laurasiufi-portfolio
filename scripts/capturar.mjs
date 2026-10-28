#!/usr/bin/env node
// Captura uma rota para comparar com o Figma. Uso:
//   node scripts/capturar.mjs <rota> <saida.png> [largura=1440] [--hover=<seletor>] [--dpr=2]
// Base: BASE_URL (padrão http://localhost:3000).
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const hover = args.find((a) => a.startsWith("--hover="))?.slice(8);
const dpr = Number(args.find((a) => a.startsWith("--dpr="))?.slice(6) ?? 2);
const [route = "/", out = "captura.png", width = "1440"] = args.filter(
  (a) => !a.startsWith("--"),
);
const base = process.env.BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  deviceScaleFactor: dpr,
  reducedMotion: "reduce",
});
await page.goto(base + route, { waitUntil: "networkidle" });
await page.addStyleTag({
  // nextjs-portal: indicador do next dev, que aparece no canto da captura.
  content:
    "*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}nextjs-portal{display:none!important}",
});
await page.evaluate(() => document.fonts.ready);
// Força o carregamento de imagens lazy rolando até o fim.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 50));
  }
  window.scrollTo(0, 0);
});
await page.waitForLoadState("networkidle");
await page.evaluate(() =>
  Promise.all(
    [...document.images].map((i) =>
      i.complete ? null : new Promise((r) => (i.onload = i.onerror = r)),
    ),
  ),
);
// Viewport da altura da página: assim o hover não se perde quando o screenshot de página inteira
// rola de volta ao topo (o mouse fica numa coordenada da janela, não do documento).
const fullHeight = await page.evaluate(
  () => document.documentElement.scrollHeight,
);
await page.setViewportSize({ width: Number(width), height: fullHeight });
if (hover) {
  await page.hover(hover);
  await page.waitForTimeout(100);
}
await page.screenshot({ path: out, fullPage: true });
const size = await page.evaluate(() => [
  document.documentElement.scrollWidth,
  document.documentElement.scrollHeight,
]);
console.log(`${out} — ${size[0]}×${size[1]} CSS px`);
await browser.close();
