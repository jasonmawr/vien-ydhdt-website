import type { Metadata } from "next";
import Link from "next/link";
import { Stethoscope, UserRound, CalendarDays, ShieldCheck, Clock, CreditCard } from "lucide-react";
import { getExamPricing } from "@/services/api";

export const metadata: Metadata = {
  title: "Đặt Lịch Khám - Viện Y Dược Học Dân Tộc",
  description: "Đặt lịch khám bệnh trực tuyến tại Viện Y Dược Học Dân Tộc. Chọn theo chuyên khoa, bác sĩ hoặc ngày khám. Hỗ trợ BHYT và thanh toán QR VietinBank.",
};

const bookingModes = [
  {
    title: "Đặt khám theo\nChuyên khoa",
    description: "Chọn chuyên khoa phù hợp với triệu chứng, hệ thống tự phân bổ bác sĩ giỏi nhất.",
    icon: Stethoscope,
    href: "/dat-lich/chuyen-khoa",
    gradient: "from-emerald-600 to-teal-700",
    iconBg: "bg-emerald-500/20",
  },
  {
    title: "Đặt khám theo\nBác sĩ",
    description: "Chọn trực tiếp bác sĩ bạn tin tưởng, xem lịch trống và đặt ngay.",
    icon: UserRound,
    href: "/dat-lich/bac-si",
    gradient: "from-blue-600 to-indigo-700",
    iconBg: "bg-blue-500/20",
  },
  {
    title: "Đặt khám theo\nNgày",
    description: "Chọn ngày phù hợp lịch cá nhân, xem tất cả khung giờ còn trống.",
    icon: CalendarDays,
    href: "/dat-lich/ngay",
    gradient: "from-amber-600 to-orange-700",
    iconBg: "bg-amber-500/20",
  },
];

const features = [
  { icon: Clock, text: "Tiết kiệm thời gian chờ đợi" },
  { icon: ShieldCheck, text: "Hỗ trợ BHYT đúng tuyến" },
  { icon: CreditCard, text: "Thanh toán QR VietinBank" },
];

export default async function DatLichPage() {
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
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">Đặt Lịch Khám</h1>
          <p className="text-lg text-emerald-50 leading-relaxed mb-8">
            Hệ thống đặt lịch trực tuyến giúp bạn chủ động thời gian,
            tránh tình trạng chờ đợi và nhận được sự tư vấn tốt nhất từ đội ngũ Y Bác sĩ của chúng tôi.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-emerald-100">
                <f.icon className="h-5 w-5 text-amber-300" />
                <span>{f.text}</span>
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
                    {mode.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    {mode.description}
                  </p>

                  {/* CTA */}
                  <div className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${mode.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                    Đặt khám ngay
                    <span className="text-primary-800 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pricing Preview */}
          <div className="mt-12 bg-white rounded-2xl shadow-md border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-6 text-center">Bảng Giá Khám Bệnh (Tham Khảo)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Dịch vụ</th>
                    <th className="text-right py-3 px-4 font-semibold text-emerald-700">BHYT</th>
                    <th className="text-right py-3 px-4 font-semibold text-blue-700">Dịch Vụ<br/><span className="text-xs font-normal opacity-80">(Không BHYT)</span></th>
                    <th className="text-right py-3 px-4 font-semibold text-amber-700">Khám theo<br/>Yêu cầu</th>
                    <th className="text-right py-3 px-4 font-semibold text-purple-700">Khám<br/>Chuyên gia</th>
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
                        Đang cập nhật bảng giá...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center italic">
              * Giá trên được trích xuất trực tiếp từ hệ thống quản lý viện phí. Giá thực tế có thể thay đổi theo quy định.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
