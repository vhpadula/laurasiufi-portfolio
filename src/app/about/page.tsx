import type { Metadata } from "next";
import Image from "next/image";
import { CroppedImage } from "@/components/CroppedImage";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AboutShape } from "@/components/vectors";
import { place, text } from "@/lib/place";

// Figma: SITE › "pag 2" (15:224), 1440×3791. Hover do menu: 49:77.
// Textos com erros de digitação no Figma estão corrigidos (ver PROGRESSO.md).

export const metadata: Metadata = { title: "About" };

const IMG = "/images/about";
const SIZES = (w: number) =>
  `(min-width: 1440px) ${w}px, ${Math.round((w / 1440) * 100)}vw`;
const p = place(1440);

const body = text(48, 65.088, 0, 0.75);
// No mobile o texto cresce e ganha linhas; alguns blocos sobem/alargam para caber na faixa de fundo.
const paragraph = "abs t font-grotesque whitespace-normal max-md:[--fs:56]!";
const bleed = "bleed-x bg-ink [--bg:var(--color-ink)]";

/** relativeTransform do Figma → CSS: posição em left/top, rotação/escala em matrix() a partir do canto. */
const matrix = ([[a, c], [b, d]]: readonly [
  readonly number[],
  readonly number[],
]) =>
  ({
    transform: `matrix(${a}, ${b}, ${c}, ${d}, 0, 0)`,
    transformOrigin: "0 0",
  }) as const;

export default function About() {
  return (
    <div className="overflow-x-clip">
      <div id="top" className="relative mx-auto max-w-[1440px]">
        <Header active="about" brand />
        <main className="cv" style={{ aspectRatio: "1440 / 3186" }}>
          <div className={`abs ${bleed}`} style={p(0, 2677, 1440, 509)} />

          {/* image 34: girada −111,57° e recortada (CROP); sai pela borda esquerda do frame. */}
          <div className="abs overflow-hidden" style={p(0, 0, 1440, 1400)}>
            <div
              className="abs overflow-hidden"
              style={{
                ...p(1081.4302, 565.932, 868.9129, 1245.6649),
                ...matrix([
                  [-0.3676, -0.93],
                  [0.93, -0.3676],
                ]),
              }}
            >
              <CroppedImage
                src={`${IMG}/swirl.png`}
                alt=""
                sizes={SIZES(1082)}
                preload
                transform={[
                  [1.0045, 0, 0],
                  [0, 0.8098, 0.1898],
                ]}
              />
            </div>
          </div>

          <h1
            className="abs t font-notable whitespace-normal"
            style={p(638, 266, 758, undefined, text(128, 123.5251, 14.08, 1.5))}
          >
            <span className="block">Hi </span>
            <span className="block">there!</span>
          </h1>
          <p
            className={`${paragraph} text-title`}
            style={p(854, 759, 467, undefined, body)}
          >
            My name is Laura, a graduated artist and designer in eternal
            formation.
          </p>
          <p
            className="abs t font-contrail max-md:[--fs:64]!"
            style={p(103, 1157, undefined, undefined, text(36, 45.0703))}
          >
            SP - BR
          </p>

          <div
            className="abs border border-ink"
            style={p(185, 1282, 1052, 905)}
          />
          <div className={`abs ${bleed}`} style={p(0, 1350, 1440, 769)} />
          <p
            className={`${paragraph} font-bold text-cream`}
            style={p(124, 1637, 587, 195, body)}
          >
            My graduation on Visual Arts gave me a sensitive gaze and a creative
            mind.
          </p>
          <div className="abs overflow-hidden" style={p(711, 1389, 705, 692)}>
            <CroppedImage
              src={`${IMG}/radial.png`}
              alt=""
              sizes={SIZES(705)}
              transform={[
                [1, 0, 0],
                [0, 0.5518, 0.2197],
              ]}
            />
          </div>

          <p
            className={`${paragraph} text-title max-md:[--y:2270]!`}
            style={p(470, 2302, 827, undefined, body)}
          >
            Meanwhile, the beginning of my journey as an UX/UI Designer is
            allowing me to transform my sensibility and creativity on solutions
            that help people.
          </p>
          <div
            className="abs rounded-[50%] border-2 border-white"
            style={p(28, 2782, 621, 314)}
          />
          <div
            className="abs rounded-[50%] border-2 border-white"
            style={p(28, 2822, 621, 314)}
          />
          {/* A foto sai pela borda esquerda do frame (x −79); o quadro em volta corta como o Figma. */}
          <div className="abs overflow-hidden" style={p(0, 2187, 720, 900)}>
            <div
              className="abs overflow-hidden rounded-[calc(243*var(--u))]"
              style={{
                ...place(1440, 0, 2187)(-79, 2298.2432, 486, 795),
                ...matrix([
                  [0.9735, 0.2289],
                  [-0.2289, 0.9735],
                ]),
              }}
            >
              <Image
                src={`${IMG}/portrait.png`}
                alt="Portrait of Laura Siufi"
                fill
                sizes={SIZES(527)}
                className="object-cover"
              />
            </div>
          </div>
          <AboutShape
            className="abs"
            style={p(20.45, 2687.47, 591.73, 366.03)}
          />
          <p
            className={`${paragraph} font-bold text-cream max-md:[--y:2705]! max-md:[--w:650]!`}
            style={p(764, 2761, 587, 195, body)}
          >
            I like to explore new possibilities, question the obvious and
            understand how little details can transform an experience.
          </p>
        </main>
        <Footer
          heading="nice to meet you."
          y={3186}
          h={605}
          headingAt={[350, 3371]}
          emailAt={[350, 3484]}
          upAt={[1304, 3683]}
        />
      </div>
    </div>
  );
}
