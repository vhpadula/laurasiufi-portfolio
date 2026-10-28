import { place, text } from "@/lib/place";
import { UpArrow } from "./vectors";

type Point = readonly [x: number, y: number];

type Props = {
  /** Título do rodapé ("Thanks for scrolling", "nice to meet you."). */
  heading: string;
  /** Faixa do frame ocupada pelo rodapé (y inicial e altura, em px do Figma). */
  y: number;
  h: number;
  headingAt: Point;
  emailAt: Point;
  /** Canto do SVG do "botão subir" (render bounds, inclui a espessura da barra). */
  upAt: Point;
  className?: string;
};

const EMAIL = "laura_siufi@hotmail.com";

export function Footer({ heading, y, h, headingAt, emailAt, upAt, className = "" }: Props) {
  const p = place(1440, 0, y);
  return (
    <footer className={`cv ${className}`} style={{ aspectRatio: `1440 / ${h}` }}>
      <h2
        className="abs t font-notable text-ink max-md:[--fs:76]!"
        style={p(headingAt[0], headingAt[1], undefined, undefined, text(64, 83.2, 0, 2))}
      >
        {heading}
      </h2>
      <a
        href={`mailto:${EMAIL}`}
        className="abs t font-content text-slate hover:text-accent max-md:[--fs:64]!"
        style={p(emailAt[0], emailAt[1], undefined, undefined, text(36, 66.2168, 0, 2))}
      >
        {EMAIL}
      </a>
      <a href="#top" aria-label="Back to top" className="abs" style={p(upAt[0], upAt[1], 47, 46)}>
        <UpArrow className="size-full" />
      </a>
    </footer>
  );
}
