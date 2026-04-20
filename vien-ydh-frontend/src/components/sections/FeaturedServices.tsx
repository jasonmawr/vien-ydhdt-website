import Link from "next/link";
import { ArrowRight, Leaf, Activity, Stethoscope, Heart } from "lucide-react";
import { DEPARTMENTS_DATA } from "@/services/mockData";
import { cn } from "@/lib/utils";

const ICONS = {
  Stethoscope,
  Activity,
  Heart,
  ClipboardPlus: Leaf, // Fallback
};

export default function FeaturedServices() {
  return (
    <section className="section-padding bg-white">
      <div className="container-site">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center rounded-full bg-[#ecfdf5] px-3 py-1 mb-4">
            <span className="text-sm font-semibold text-primary-800">Dịch Vụ Cốt Lõi</span>
          </div>
          <h2 className="section-title">Chuyên Khoa Nổi Bật</h2>
          <div className="divider-herb"></div>
          <p className="section-subtitle">
            Khám phá các dịch vụ y tế kết hợp hoàn hảo giữa tinh hoa Y học cổ truyền và Y học hiện đại.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {DEPARTMENTS_DATA.map((dept, index) => {
            const IconComponent = ICONS[dept.icon as keyof typeof ICONS] || Leaf;
            
            return (
              <div 
                key={dept.id} 
                className="card group p-8 animate-fade-in-up flex flex-col h-full border border-gray-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ecfdf5] text-primary-800 transition-colors duration-300 group-hover:bg-primary-800 group-hover:text-white">
                  <IconComponent className="h-8 w-8" strokeWidth={1.5} />
                </div>
                
                <h3 className="mb-3 font-heading text-xl font-bold text-[#1a1a1a]">
                  {dept.name}
                </h3>
                
                <p className="mb-6 text-[#6b7280] flex-1">
                  {dept.description}
                </p>
                
                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-5">
                  <span className="text-sm font-medium text-primary-800">
                    {dept.doctorCount} Bác sĩ
                  </span>
                  <Link 
                    href={`/chuyen-khoa/${dept.slug}`} 
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-primary-800 transition-transform group-hover:bg-[#ecfdf5] group-hover:-rotate-45"
                    aria-label={`Tìm hiểu thêm về ${dept.name}`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/chuyen-khoa" className="btn-outline">
            Xem tất cả chuyên khoa
          </Link>
        </div>
      </div>
    </section>
  );
}
