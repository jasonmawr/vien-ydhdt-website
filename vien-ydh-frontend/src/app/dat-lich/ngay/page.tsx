import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BookingForm from "@/components/features/BookingForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('booking');
  return {
    title: t('modes.date') + " - Viện Y Dược Học Dân Tộc",
    description: t('datePageDescription'),
  };
}

export default async function BookingByDatePage() {
  const t = await getTranslations('booking');

  return (
    <div className="bg-[#fbf9f6] min-h-screen pb-20">
      <section className="bg-primary-800 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#d97706] blur-3xl"></div>
        </div>
        <div className="container-site relative z-10 text-center max-w-3xl">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">{t('modes.date')}</h1>
          <p className="text-lg text-emerald-50 leading-relaxed">
            {t('datePageSubtitle')}
          </p>
        </div>
      </section>

      <section className="section-padding -mt-12 relative z-20">
        <div className="container-site max-w-4xl">
          <BookingForm initialStep={3} />
        </div>
      </section>
    </div>
  );
}
