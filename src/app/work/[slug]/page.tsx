import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FigmaCanvas } from "@/components/FigmaCanvas";
import { cases, isCaseSlug } from "@/content/cases";
import { caseFontVariables } from "../fonts";

export function generateStaticParams() {
  return Object.keys(cases).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return isCaseSlug(slug) ? { title: cases[slug].title } : {};
}

export default async function CasePage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  if (!isCaseSlug(slug)) notFound();
  const { data, opts } = cases[slug];
  return (
    <div className={`overflow-x-clip ${caseFontVariables}`}>
      <main className="relative mx-auto max-w-[1440px]">
        <FigmaCanvas data={data} opts={opts} />
      </main>
    </div>
  );
}
