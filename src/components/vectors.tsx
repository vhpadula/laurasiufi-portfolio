// Vetores exportados do Figma (GET /v1/images?format=svg), inline para herdar cor e escalar.
import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

/** "botão abrir" (49:53): seta dentro de um círculo. */
export function OpenArrow(props: Props) {
  return (
    <svg viewBox="0 0 77 77" fill="none" aria-hidden {...props}>
      <path
        d="M22 39L22 41.5L55 41.5L55 39L55 36.5L22 36.5L22 39ZM56.7678 40.7678C57.7441 39.7915 57.7441 38.2085 56.7678 37.2322L40.8579 21.3223C39.8816 20.346 38.2986 20.346 37.3223 21.3223C36.346 22.2986 36.346 23.8816 37.3223 24.8579L51.4645 39L37.3223 53.1421C36.346 54.1184 36.346 55.7014 37.3223 56.6777C38.2986 57.654 39.8816 57.654 40.8579 56.6777L56.7678 40.7678Z"
        fill="#2D3047"
      />
      <path
        d="M76.5 38.5C76.5 59.4868 59.4868 76.5 38.5 76.5C17.5132 76.5 0.5 59.4868 0.5 38.5C0.5 17.5132 17.5132 0.5 38.5 0.5C59.4868 0.5 76.5 17.5132 76.5 38.5Z"
        stroke="black"
      />
    </svg>
  );
}

/** "botão subir" (49:34): seta para cima sob uma barra. */
export function UpArrow(props: Props) {
  return (
    <svg viewBox="0 0 47 46" fill="none" aria-hidden {...props}>
      <path
        d="M24 46L26.5 46L26.5 13L24 13L21.5 13L21.5 46L24 46ZM25.7678 11.2322C24.7915 10.2559 23.2085 10.2559 22.2322 11.2322L6.32233 27.1421C5.34602 28.1184 5.34602 29.7014 6.32233 30.6777C7.29864 31.654 8.88155 31.654 9.85786 30.6777L24 16.5355L38.1421 30.6777C39.1184 31.654 40.7014 31.654 41.6777 30.6777C42.654 29.7014 42.654 28.1184 41.6777 27.1421L25.7678 11.2322Z"
        fill="#A45E02"
      />
      <path d="M0 2H47" strokeWidth="4" stroke="#A45E02" />
    </svg>
  );
}

/** "Ellipse 2" (49:42): mancha laranja atrás do card da TuttiFree. */
export function TuttiBlob(props: Props) {
  return (
    <svg
      viewBox="0 0 1465 644"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
      {...props}
    >
      <path
        d="M1465 154.094C1465 424.161 1137.05 643.094 732.5 643.094C327.951 643.094 0 424.161 0 154.094C0 -115.973 309.951 51.0936 714.5 51.0936C1119.05 51.0936 1465 -115.973 1465 154.094Z"
        fill="#EEAD44"
      />
    </svg>
  );
}

/** "Vector 1" (16:301): forma preta que liga a foto do About à faixa preta. */
export function AboutShape(props: Props) {
  return (
    <svg viewBox="0 0 592 367" fill="none" aria-hidden {...props}>
      <path
        d="M9.87921 47.3363L4.58181 53.2046L2.31415e-05 59.932L107.743 366.028L576.173 277.834L591.726 232.572L558.608 190.023L458.673 103.603L432.681 80.4378L421.001 74.4524L405.227 66.3478L392.631 56.4686L380.264 47.5629L361.599 38.0836L342.189 29.8067L327.131 22.5611L315.336 16.089L256.852 164.927C142.559 337.675 97.3645 228.624 89.054 152.506L128.185 -8.9474e-05L107.743 4.80671L87.7868 9.49906L73.6718 12.818L64.6529 15.966L57.6953 19.1429L49.2776 22.6631L40.0009 26.899L33.6445 30.4482L26.0569 35.3141L17.238 41.4969L9.87921 47.3363Z"
        fill="black"
      />
    </svg>
  );
}
