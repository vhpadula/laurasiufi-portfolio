import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { OpenArrow, TuttiBlob } from "@/components/vectors";
import { place, text } from "@/lib/place";

// Figma: SITE › "pag 1" (49:22), 1440×5934. Coordenadas abaixo são as do frame.
// Hovers: 51:107 (TuttiFree), 53:166 (Itaú), 53:224 (Trama).

const IMG = "/images/home";
const SIZES = (w: number) =>
  `(min-width: 1440px) ${w}px, ${Math.round((w / 1440) * 100)}vw`;

const kicker = text(48, 65.088, 0, 0.75);
const nav = text(36, 45.0703);
const moreAbout = text(36, 34.7414, 0, 1);
const shadow = "shadow-[0_calc(4*var(--u))_calc(4*var(--u))_rgb(0_0_0/0.25)]";
const cardTitle = "abs t font-grotesque text-title max-md:[--fs:80]!";
const moreAboutText =
  "abs t anim flex justify-center font-notable max-md:[--fs:72]!";

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <div id="top" className="relative mx-auto max-w-[1440px]">
        <Header active="work" />
        <main>
          <Hero />
          <SelectedWorks />
          <Itau />
          <Trama />
        </main>
        <Footer
          heading="Thanks for scrolling"
          y={5094}
          h={840}
          headingAt={[221, 5414]}
          emailAt={[221, 5521]}
          upAt={[1311, 5820]}
          className="bleed-x bg-cream [--bg:var(--color-cream)]"
        />
      </div>
    </div>
  );
}

function Hero() {
  const p = place(1440);
  return (
    <section
      className="cv overflow-hidden"
      style={{ aspectRatio: "1440 / 1242" }}
    >
      <div className="abs" style={p(685, -61, 755, 1343)}>
        <Image
          src={`${IMG}/hero-illustration.png`}
          alt=""
          fill
          sizes={SIZES(755)}
          loading="eager"
          fetchPriority="high"
          className="object-cover"
        />
      </div>
      <p
        className="abs t font-grotesque text-accent max-md:[--fs:80]!"
        style={p(120, 410, undefined, undefined, kicker)}
      >
        UX/UI Design
      </p>
      <h1
        className="abs t font-notable whitespace-normal"
        style={p(120, 487, 765, undefined, text(128, 123.5251, 14.08, 1.5))}
      >
        <span className="block">Laura </span>
        {/* Override do Figma: "Siufi" com letterSpacing 42.24px. */}
        <span className="block tracking-[0.33em]">Siufi</span>
      </h1>
      <p
        className="abs t font-contrail max-md:[--fs:64]!"
        style={p(1253, 1070, undefined, undefined, nav)}
      >
        SP - BR
      </p>
    </section>
  );
}

function SelectedWorks() {
  const p = place(1440, 0, 1242);
  const l = place(1440, 0, 1466);
  const g = place(1461, -10, 1561);
  const bread = (src: string, alt: string, x: number, w: number) => (
    <div className="abs" style={g(x, 1771.74, w, 377.31)}>
      <Image
        src={`${IMG}/${src}.png`}
        alt={alt}
        fill
        sizes={SIZES(w)}
        className="object-cover"
      />
    </div>
  );

  return (
    <section
      id="work"
      aria-labelledby="selected-works"
      className="cv"
      style={{ aspectRatio: "1440 / 1526" }}
    >
      <div
        className="abs bleed-x bg-cream [--bg:var(--color-cream)]"
        style={p(0, 1242, 1440, 875)}
      />
      <h2
        id="selected-works"
        className="abs t font-contrail max-md:[--fs:64]!"
        style={p(155, 1327, undefined, undefined, text(36, 45.0703, 2.52))}
      >
        Selected works
      </h2>
      <div className="abs bg-ink" style={p(-42, 1381, 445, 3)} />

      <Link
        href="/work/tuttifree"
        className="cv abs group"
        style={p(0, 1466, 1440, 1092)}
      >
        <h3
          className={cardTitle}
          style={l(164, 1466, undefined, undefined, kicker)}
        >
          TuttiFree - Brand identity and interface
        </h3>
        <TuttiBlob
          className="abs anim group-hover:[--y:471]! group-hover:[--h:621]!"
          style={l(-10, 1914.91, 1465, 643.09)}
        />

        {/* Group 29: no hover o card cresce 8% a partir do topo (51:107). */}
        <div
          className="cv abs anim group-hover:[--x:-69]! group-hover:[--w:1578]! group-hover:[--h:707]!"
          style={l(-10, 1561, 1461, 654.68)}
        >
          <div
            className={`abs rounded-[calc(20*var(--u))] bg-white ${shadow}`}
            style={g(164, 1561, 1115.67, 654.68)}
          />
          <div className="abs bg-honey" style={g(-10, 1909, 1461, 103)} />
          <div
            className="abs border border-honey"
            style={g(201.19, 1626.86, 1040.52, 125.51)}
          />
          {bread("tutti-pao-batata-doce", "Sweet potato bread", 178.72, 268.07)}
          {bread("tutti-pao-grao-de-bico", "Chickpea bread", 391.01, 268.07)}
          {bread(
            "tutti-pao-aveia-sementes",
            "Oat and seed bread",
            1005.4,
            268.07,
          )}
          {bread("tutti-pao-simples", "Plain bread", 791.57, 278.59)}
          {bread("tutti-pao-australiano", "Australian bread", 639.71, 199.12)}
          <div
            className="abs overflow-hidden"
            style={g(609.49, 1583.47, 234.76, 161.93)}
          >
            {/* imageTransform do Figma: recorte de 95,9% × 95,5% a partir de (4,1%, 0,2%). */}
            <div className="absolute top-[-0.19%] left-[-4.29%] h-[104.69%] w-[104.29%]">
              <Image
                src={`${IMG}/tutti-logo.png`}
                alt="TuttiFree"
                fill
                sizes={SIZES(245)}
                className="object-fill"
              />
            </div>
          </div>
        </div>

        <span
          className="abs anim rounded-full group-hover:bg-cream group-hover:shadow-[0_calc(4*var(--u))_calc(4*var(--u))_rgb(0_0_0/0.25)]"
          style={l(1314, 1583, 77, 77)}
        >
          <OpenArrow className="size-full" />
        </span>
        {/* Line 5/6: traço de 2px do ponto esquerdo ao direito (relativeTransform do Figma).
            O Figma desenha o traço de um lado só da linha (y local negativo): girada ~180°, fica
            abaixo dos pontos. No hover (51:107) encurtam e mudam de inclinação. */}
        <span
          className="abs anim origin-left rotate-(--r) bg-cream group-hover:[--w:451.01]! group-hover:[--r:0.381deg]!"
          style={l(-30, 2348, 504.04, 2, { "--r": "0.682deg" })}
        />
        <span
          className="abs anim origin-left rotate-(--r) bg-cream group-hover:[--x:1013]! group-hover:[--y:895]! group-hover:[--w:440]! group-hover:[--r:-0.13deg]!"
          style={l(949, 2354, 504.04, 2, { "--r": "0.682deg" })}
        />
        <span
          className={`${moreAboutText} text-cream group-hover:[--x:431]! group-hover:[--y:850]! group-hover:[--w:582]! group-hover:[--fs:64]!`}
          style={l(511, 2335, 418, 69, moreAbout)}
        >
          more about
        </span>
      </Link>
    </section>
  );
}

function Itau() {
  const p = place(1440, 0, 2768);
  return (
    <Link
      href="/work/itau"
      className="cv group block"
      style={{ aspectRatio: "1440 / 1245" }}
    >
      <div
        className="abs anim bleed-r bg-orange [--bg:var(--color-orange)] group-hover:[--y:401]! group-hover:[--h:533]!"
        style={p(442, 3253, 998, 386)}
      />
      {/* Hover (53:166): a imagem cresce para 998×1179 em (1, 2833). */}
      <div
        className="abs anim overflow-hidden group-hover:[--x:1]! group-hover:[--y:65]! group-hover:[--w:998]! group-hover:[--h:1179]!"
        style={p(73, 2867, 912, 1077)}
      >
        {/* imageTransform do Figma: recorte de 45,6% × 71,8% a partir de (27,2%, 14,27%). */}
        <div className="absolute top-[-19.87%] left-[-59.65%] h-[139.28%] w-[219.3%]">
          <Image
            src={`${IMG}/itau-phones.png`}
            alt="Itaú app screens on three phones"
            fill
            sizes={SIZES(2000)}
            className="object-fill"
          />
        </div>
      </div>
      <span className="abs" style={p(1026, 3069, 77, 77)}>
        <OpenArrow className="size-full" />
      </span>
      <h3
        className={cardTitle}
        style={p(164, 2768, undefined, undefined, kicker)}
      >
        Itaú and EBAC - UX/UI Case Study
      </h3>
      <span
        className={`${moreAboutText} text-white max-md:text-center max-md:whitespace-normal group-hover:[--x:979]! group-hover:[--y:638]! group-hover:[--fs:48]!`}
        style={p(991, 3428, 418, 69, moreAbout)}
      >
        more about
      </span>
    </Link>
  );
}

function Trama() {
  const p = place(1440, 0, 4013);
  return (
    <Link
      href="/work/trama"
      className="cv group relative z-10 block"
      style={{ aspectRatio: "1440 / 1081" }}
    >
      <div
        className="abs anim bleed-r bg-sand [--bg:var(--color-sand)] group-hover:[--y:389]! group-hover:[--h:432]!"
        style={p(150, 4467, 1356, 367)}
      />
      <div
        className="abs rounded-[calc(30*var(--u))] border border-copper"
        style={p(58, 4453, 941, 500)}
      />
      <div
        className={`abs overflow-hidden rounded-[calc(20*var(--u))] ${shadow}`}
        style={p(94, 4237, 541, 597)}
      >
        <Image
          src={`${IMG}/trama-photo.jpg`}
          alt=""
          fill
          sizes={SIZES(541)}
          className="object-cover"
        />
      </div>
      {/* Rectangle 76: 790×232 girado 31,49° (relativeTransform do Figma). */}
      <div
        className="abs origin-top-left -rotate-[31.49deg] rounded-[calc(10*var(--u))] bg-wine"
        style={p(268.97, 4720.63, 790.37, 231.89)}
      />
      {/* Hover (53:224): o celular cresce para 891×1122 em (211, 4034). */}
      <div
        className="abs anim group-hover:[--x:211]! group-hover:[--y:21]! group-hover:[--w:891]! group-hover:[--h:1122]!"
        style={p(257, 4075, 807, 1016)}
      >
        <Image
          src={`${IMG}/trama-phone.png`}
          alt="TRAMA app on a smartphone"
          fill
          sizes={SIZES(891)}
          className="object-cover"
        />
      </div>
      <span className="abs" style={p(1064, 4290, 77, 77)}>
        <OpenArrow className="size-full" />
      </span>
      <h3
        className={cardTitle}
        style={p(164, 4013, undefined, undefined, kicker)}
      >
        EBAC Project TRAMA - UX/UI Case Study
      </h3>
      <span
        className={`${moreAboutText} text-graphite max-md:text-center max-md:whitespace-normal group-hover:[--x:1040]! group-hover:[--y:582]! group-hover:[--fs:40]!`}
        style={p(1049, 4628, 360, 45, moreAbout)}
      >
        more about
      </span>
    </Link>
  );
}
