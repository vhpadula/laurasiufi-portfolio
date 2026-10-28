import type { CSSProperties } from "react";

type Vars = Record<`--${string}`, string | number>;

/**
 * Posiciona elementos em px do Figma dentro de um canvas de largura `W` (ver `.cv`/`.abs` em
 * globals.css). `ox`/`oy` é a origem do canvas no frame, para copiar as coordenadas do Figma
 * sem conta de cabeça.
 */
export function place(W: number, ox = 0, oy = 0) {
  return (x: number, y: number, w?: number, h?: number, extra?: Vars) =>
    ({
      "--W": W,
      "--x": x - ox,
      "--y": y - oy,
      // "auto" invalida o calc() e a propriedade volta ao valor inicial (auto).
      "--w": w ?? "auto",
      "--h": h ?? "auto",
      ...extra,
    }) as CSSProperties;
}

/**
 * Estilos de texto do Figma: tamanho em px, entrelinha em px → razão, letterSpacing em px → em.
 * `dy` compensa a diferença de métrica vertical entre o Figma e o Chrome (px do Figma, medido
 * por estilo contra o export: o Chrome desenha essas fontes um pouco mais alto).
 */
export const text = (
  fontSize: number,
  lineHeightPx?: number,
  letterSpacingPx = 0,
  dy = 0,
): Vars => ({
  "--fs": fontSize,
  "--lh": lineHeightPx ? +(lineHeightPx / fontSize).toFixed(4) : "normal",
  "--ls": `${+(letterSpacingPx / fontSize).toFixed(4)}em`,
  "--dy": dy,
});
