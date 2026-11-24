import { FigmaPage, Responsive } from "@/components/FigmaPage";
import { homePage } from "@/content/pages";

// Figma v2 — desktop: "Frame 18" (97:172) + hovers 97:218, 102:282, 102:332; mobile: 77:159
// (abertura) e 77:160/77:217/77:263 (carrossel de cases, botão "next").
export default function Home() {
  const { desktop, mobile } = homePage;
  return (
    <Responsive
      desktop={<FigmaPage id="home" config={desktop} />}
      mobile={
        <>
          <FigmaPage id="m-home" config={mobile.hero} />
          <div className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none]">
            {mobile.slides.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="w-full shrink-0 snap-start overflow-clip"
              >
                <FigmaPage id={`m-${s.id}`} config={s} />
              </section>
            ))}
          </div>
        </>
      }
    />
  );
}
