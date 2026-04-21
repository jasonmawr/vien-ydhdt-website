import type { Metadata } from "next";
import BookingForm from "@/components/features/BookingForm";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Đặt Lịch Khám",
  description: "Đặt lịch khám bệnh trực tuyến tại Viện Y Dược Học Dân Tộc. Quy trình nhanh chóng, tiện lợi, không phải chờ đợi lâu.",
};

export default async function DatLichPage() {
  const departments = await prisma.department.findMany();
  const doctors = await prisma.doctor.findMany();

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
          <p className="text-lg text-emerald-50 leading-relaxed">
            Hệ thống đặt lịch trực tuyến giúp bạn chủ động thời gian, 
            tránh tình trạng chờ đợi và nhận được sự tư vấn tốt nhất từ đội ngũ Y Bác sĩ của chúng tôi.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding -mt-12 relative z-20">
        <div className="container-site max-w-4xl">
          <BookingForm departments={departments} doctors={doctors} />
        </div>
      </section>
    </div>
  );
}
