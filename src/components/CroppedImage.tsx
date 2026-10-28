import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  /** Imagem acima da dobra: carrega cedo (fetchPriority alta). */
  preload?: boolean;
  /** `imageTransform` do Figma (modo CROP): [[sx, 0, tx], [0, sy, ty]], em fração da imagem. */
  transform: readonly [
    readonly [number, number, number],
    readonly [number, number, number],
  ];
};

/**
 * Imagem recortada como no modo CROP do Figma. Preenche o elemento pai (que deve ser posicionado e
 * cortar o excesso): a imagem inteira mede 1/sx × 1/sy do quadro e começa em (-tx/sx, -ty/sy).
 */
export function CroppedImage({
  src,
  alt,
  sizes,
  preload = false,
  transform,
}: Props) {
  const [[sx, , tx], [, sy, ty]] = transform;
  const pct = (v: number) => `${+(v * 100).toFixed(3)}%`;
  return (
    <div
      className="absolute"
      style={{
        left: pct(-tx / sx),
        top: pct(-ty / sy),
        width: pct(1 / sx),
        height: pct(1 / sy),
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-fill"
        {...(preload ? { loading: "eager", fetchPriority: "high" } : {})}
      />
    </div>
  );
}
