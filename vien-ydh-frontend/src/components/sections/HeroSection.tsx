'use client';

import Link from "next/link";
import { ChevronRight, Calendar, Search, Stethoscope, FileText, Phone } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-primary-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-800/90 to-transparent z-0"></div>

      <div className="relative z-10 container-site pt-20 pb-40 lg:pt-32 lg:pb-48">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-800/80 border border-primary-700 mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></span>
            <span className="text-sm font-medium text-primary-50">Đơn vị y tế xuất sắc</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight lg:text-6xl tracking-tight">
            Chăm sóc sức khỏe<br />
            <span className="text-primary-300">toàn diện</span> & <span className="text-primary-300">chuyên sâu</span>
          </h1>

          <p className="mb-10 text-lg text-primary-100 max-w-xl leading-relaxed">
            Kết hợp tinh hoa y học cổ truyền và công nghệ y học hiện đại, mang đến giải pháp điều trị tối ưu và trải nghiệm chăm sóc tốt nhất cho người bệnh.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dat-lich"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-600 px-8 py-4 text-base font-bold text-white transition-all hover:bg-accent-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Calendar className="h-5 w-5" />
              <span>Đặt lịch khám ngay</span>
            </Link>

            <Link
              href="/tim-bac-si"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/20 border border-white/20 backdrop-blur-md"
            >
              <Search className="h-5 w-5" />
              <span>Tìm Bác sĩ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Quick Action Cards (Overlapping the bottom) */}
      <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 z-20 hidden md:block">
        <div className="container-site">
          <div className="grid grid-cols-4 gap-4 lg:gap-6 px-4 lg:px-8">
            {[
              { title: 'Khám bệnh', icon: Stethoscope, href: '/dich-vu/kham-benh', desc: 'Đăng ký khám ngoại trú' },
              { title: 'Điều trị nội trú', icon: FileText, href: '/dich-vu/noi-tru', desc: 'Quy trình và thủ tục' },
              { title: 'Bảng giá dịch vụ', icon: Search, href: '/dich-vu/bang-gia', desc: 'Minh bạch chi phí' },
              { title: 'Hỗ trợ người bệnh', icon: Phone, href: '/ho-tro', desc: 'Tư vấn & giải đáp' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link key={idx} href={item.href} className="group relative bg-white rounded-xl shadow-card-premium p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-float border-b-4 border-transparent hover:border-primary-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-full -z-10 transition-transform group-hover:scale-150"></div>
                  <div className="h-12 w-12 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
