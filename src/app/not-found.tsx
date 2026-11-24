import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

// Não existe no Figma: 404 simples com os estilos do site (Notable do "Thanks for scrolling",
// Contrail One laranja do menu, Darker Grotesque dos textos).
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#f9f6f2] px-4 text-center">
      <p className="font-[family-name:var(--nf-contrail)] text-2xl text-[#a45e02]">
        404
      </p>
      <h1 className="font-[family-name:var(--nf-notable)] text-3xl tracking-[0.11em] uppercase md:text-5xl">
        Page not found
      </h1>
      <p className="max-w-md font-[family-name:var(--nf-grotesque)] text-2xl leading-tight text-[#141414]">
        The page you are looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="font-[family-name:var(--nf-contrail)] text-2xl text-[#a45e02] underline-offset-4 hover:underline focus-visible:underline"
      >
        Back to home
      </Link>
    </main>
  );
}
