import type { Metadata } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Laura Siufi — UX/UI Design",
    template: "%s — Laura Siufi",
  },
  // Não existe no Figma; texto aprovado pelo usuário.
  description:
    "Laura Siufi — UX/UI Designer based in São Paulo. Selected works: TuttiFree, Itaú, TRAMA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
