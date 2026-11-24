import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FigmaPage, Responsive } from "@/components/FigmaPage";
import { cases, isCaseSlug } from "@/content/pages";
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
  const { desktop, mobile } = cases[slug];
  return (
    <Responsive
      className={caseFontVariables}
      bg={desktop.data.bg}
      desktop={<FigmaPage id={slug} config={desktop} layout="desktop" first />}
      mobile={
        <FigmaPage id={`m-${slug}`} config={mobile} layout="mobile" first />
      }
    />
  );
}
