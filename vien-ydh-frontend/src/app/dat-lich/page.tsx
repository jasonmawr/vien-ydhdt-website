import Link from "next/link";
import { Stethoscope, UserRound, CalendarDays, ShieldCheck, Clock, CreditCard } from "lucide-react";
import { getExamPricing } from "@/services/api";
import { getTranslations } from "next-intl/server";

const bookingModes = [
  {
    titleKey: "modes.specialty",
    descriptionKey: "modes.specialtyDesc",
    icon: Stethoscope,
    href: "/dat-lich/chuyen-khoa",
    gradient: "from-emerald-600 to-teal-700",
    iconBg: "bg-emerald-500/20",
  },
  {
    titleKey: "modes.doctor",
    descriptionKey: "modes.doctorDesc",
    icon: UserRound,
    href: "/dat-lich/bac-si",
    gradient: "from-blue-600 to-indigo-700",
    iconBg: "bg-blue-500/20",
  },
  {
    titleKey: "modes.date",
    descriptionKey: "modes.dateDesc",
    icon: CalendarDays,
    href: "/dat-lich/ngay",
    gradient: "from-amber-600 to-orange-700",
    iconBg: "bg-amber-500/20",
  },
];

const features = [
  { icon: Clock, textKey: "timeSave" },
  { icon: ShieldCheck, textKey: "bhytSupport" },
  { icon: CreditCard, textKey: "qrPayment" },
];

export async function generateMetadata() {
  const t = await getTranslations('booking');
  const tPricing = await getTranslations('pricing');
  return {
    title: t('title') + " - Viện Y Dược Học Dân Tộc",
    description: t('subtitle'),
  };
}

export default async function DatLichPage() {
  const t = await getTranslations('booking');
  const tFeatures = await getTranslations('features');
  const tPricing = await getTranslations('pricing');
  const pricingData = await getExamPricing().catch(() => []);

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
          <p className="text-lg text-emerald-50 leading-relaxed mb-8">
            {t('subtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-emerald-100">
                <f.icon className="h-5 w-5 text-amber-300" />
                <span>{tFeatures(f.textKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Booking Mode Cards */}
      <section className="section-padding -mt-12 relative z-20">
        <div className="container-site max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            {bookingModes.map((mode) => (
              <Link
                key={mode.href}
                href={mode.href}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
              >
                {/* Gradient Top Bar */}
                <div className={`h-2 bg-gradient-to-r ${mode.gradient}`} />

                <div className="p-8">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl ${mode.iconBg} mb-6 group-hover:scale-110 transition-transform`}>
                    <mode.icon className="h-8 w-8 text-primary-800" />
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-[#1a1a1a] mb-3 whitespace-pre-line leading-tight">
                    {t(mode.titleKey)}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    {t(mode.descriptionKey)}
                  </p>

                  {/* CTA */}
                  <div className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${mode.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                    {t('common.continue')}
                    <span className="text-primary-800 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pricing Preview */}
          <div className="mt-12 bg-white rounded-2xl shadow-md border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-6 text-center">{tPricing('title')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">{tPricing('service')}</th>
                    <th className="text-right py-3 px-4 font-semibold text-emerald-700">{tPricing('bhyt')}</th>
                    <th className="text-right py-3 px-4 font-semibold text-blue-700">{tPricing('dichVu')}<br/><span className="text-xs font-normal opacity-80">({t('step4.patientType.dich-vu')})</span></th>
                    <th className="text-right py-3 px-4 font-semibold text-amber-700">{tPricing('yeuCau')}<br/><span className="text-xs font-normal opacity-80">({t('step4.patientType.yeu-cau')})</span></th>
                    <th className="text-right py-3 px-4 font-semibold text-purple-700">{tPricing('chuyenGia')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingData.length > 0 ? (
                    pricingData.map((item, index) => (
                      <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="py-3 px-4 text-right text-emerald-700 font-semibold">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.priceBHYT)}
                        </td>
                        <td className="py-3 px-4 text-right text-blue-700">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.priceService)}
                        </td>
                        <td className="py-3 px-4 text-right text-amber-700">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.priceRequest)}
                        </td>
                        <td className="py-3 px-4 text-right text-purple-700">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.priceExpert)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">
                        {tPricing('updating')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center italic">
              * {tPricing('note.text')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
