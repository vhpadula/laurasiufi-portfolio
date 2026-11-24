import type { Metadata } from "next";
import { FigmaPage, Responsive } from "@/components/FigmaPage";
import { aboutPage } from "@/content/pages";

export const metadata: Metadata = { title: "About" };

// Figma v2 — desktop: "pag 2" (102:1802) + hover do "Work" (116:77); mobile: 77:288, 77:304,
// 77:322 e 77:339 em sequência.
export default function About() {
  const { desktop, mobile } = aboutPage;
  return (
    <Responsive
      desktop={<FigmaPage id="about" config={desktop} />}
      mobile={mobile.map((c, i) => (
        <FigmaPage key={i} id={`m-about-${i}`} config={c} />
      ))}
    />
  );
}
