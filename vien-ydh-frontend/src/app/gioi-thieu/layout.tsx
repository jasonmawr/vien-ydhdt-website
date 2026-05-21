import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PageLayout from "@/components/layout/PageLayout";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const tTitle = await getTranslations('nav');
  const tDesc = await getTranslations('about.hero');
  const tMeta = await getTranslations('metadata');

  return {
    title: `${tTitle('about')} - ${tMeta('siteName')}`,
    description: tDesc('subtitle'),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout>
      <BreadcrumbJsonLd items={[
        { name: "Trang chủ", url: "/" },
        { name: "Giới thiệu", url: "/gioi-thieu" },
      ]} />
      {children}
    </PageLayout>
  );
}
