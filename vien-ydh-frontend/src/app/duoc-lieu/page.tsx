import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HerbDictionary from "@/components/features/HerbDictionary";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations('herbs');
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function DuocLieuPage() {
  const t = await getTranslations('herbs');

  return (
    <div className="bg-[#fbf9f6] min-h-screen pb-20">
      {/* Header Banner */}
      <section className="bg-primary-800 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#d97706] blur-3xl"></div>
        </div>
        <div className="container-site relative z-10 text-center max-w-3xl">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">{t('title')}</h1>
          <p className="text-lg text-emerald-50 leading-relaxed">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding -mt-8 relative z-20">
        <div className="container-site">
          <HerbDictionary />
        </div>
      </section>
    </div>
  );
}
