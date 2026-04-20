import type { Metadata } from "next";
import HerbDictionary from "@/components/features/HerbDictionary";

export const metadata: Metadata = {
  title: "Từ Điển Dược Liệu",
  description: "Tra cứu thông tin chi tiết, công dụng và cách dùng của các vị thuốc Đông y tại Viện Y Dược Học Dân Tộc.",
};

export default function DuocLieuPage() {
  return (
    <div className="bg-[#fbf9f6] min-h-screen pb-20">
      {/* Header Banner */}
      <section className="bg-primary-800 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#d97706] blur-3xl"></div>
        </div>
        <div className="container-site relative z-10 text-center max-w-3xl">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">Từ Điển Dược Liệu</h1>
          <p className="text-lg text-emerald-50 leading-relaxed">
            Khám phá kho tàng tri thức Y học Cổ truyền với hàng trăm vị thuốc quý. 
            Tìm hiểu chi tiết về tính vị, công dụng và bài thuốc chữa bệnh.
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
