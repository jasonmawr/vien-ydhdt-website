import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PageLayout from "@/components/layout/PageLayout";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const tTitle = await getTranslations('nav');
  const tDesc = await getTranslations('news');
  const tMeta = await getTranslations('metadata');

  return {
    title: `${tTitle('news')} - ${tMeta('siteName')}`,
    description: tDesc('subtitle'),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout>
      <BreadcrumbJsonLd items={[
        { name: "Trang chủ", url: "/" },
        { name: "Tin tức", url: "/tin-tuc" },
      ]} />
      {children}
    </PageLayout>
  );
}
