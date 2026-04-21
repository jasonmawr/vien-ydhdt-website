import Link from "next/link";
import { CalendarCheck, ArrowRight } from "lucide-react";
import { DOCTORS_DATA } from "@/services/mockData";
import { formatCurrency } from "@/lib/utils";

export default function FeaturedDoctors() {
  const featuredDoctors = DOCTORS_DATA.filter((doc) => doc.isFeatured).slice(0, 4);

  return (
    <section className="section-padding bg-white">
      <div className="container-site">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-8 h-1 bg-primary-600 rounded-full"></span>
              <span className="text-sm font-bold uppercase tracking-widest text-primary-700">Đội ngũ</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Chuyên gia Y tế hàng đầu
            </h2>
          </div>
          <Link
            href="/bac-si"
            className="inline-flex items-center gap-2 font-semibold text-primary-700 hover:text-primary-800 group"
          >
            <span>Tìm bác sĩ khác</span>
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 group-hover:bg-primary-200 transition-colors">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                <img
                  src={doc.imageUrl}
                  alt={`Chân dung ${doc.degree} ${doc.fullName}`}
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-60"></div>
                
                {/* Floating Info on Image */}
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                  <p className="text-primary-200 text-sm font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    {doc.degree}
                  </p>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {doc.fullName}
                  </h3>
                  <p className="text-white/80 text-sm font-medium">
                    {doc.specialty}
                  </p>
                </div>
              </div>

              {/* Action Area */}
              <div className="p-5 flex items-center justify-between bg-white">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Phí khám</p>
                  <p className="text-primary-700 font-bold">{formatCurrency(doc.consultFee)}</p>
                </div>
                <Link
                  href={`/dat-lich?doctor=${doc.id}`}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white transition-colors"
                  aria-label={`Đặt lịch khám với ${doc.fullName}`}
                >
                  <CalendarCheck className="h-5 w-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
