import Link from "next/link";
import { Star, Clock, CalendarCheck } from "lucide-react";
import { DOCTORS_DATA } from "@/services/mockData";
import { formatCurrency } from "@/lib/utils";

export default function FeaturedDoctors() {
  const featuredDoctors = DOCTORS_DATA.filter((doc) => doc.isFeatured).slice(0, 3);

  return (
    <section className="section-padding bg-[#fbf9f6]">
      <div className="container-site">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center rounded-full bg-[#fef3c7] px-3 py-1 mb-4">
            <span className="text-sm font-semibold text-[#d97706]">Đội Ngũ Chuyên Gia</span>
          </div>
          <h2 className="section-title">Bác Sĩ Tiêu Biểu</h2>
          <div className="divider-herb"></div>
          <p className="section-subtitle">
            Hội tụ đội ngũ Giáo sư, Tiến sĩ, Bác sĩ chuyên khoa giàu kinh nghiệm, tận tâm với nghề.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredDoctors.map((doc, index) => (
            <div 
              key={doc.id} 
              className="card group animate-fade-in-up bg-white flex flex-col"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={doc.imageUrl} 
                  alt={`Chân dung ${doc.degree} ${doc.fullName}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="badge-accent shadow-sm">{doc.degree}</span>
                </div>
                <div className="absolute bottom-4 right-4 rounded-full bg-white px-2 py-1 text-xs font-bold text-[#d97706] shadow-md flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {doc.rating} ({doc.reviewCount})
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-heading text-xl font-bold text-[#1a1a1a] mb-1">
                  <Link href={`/bac-si/${doc.slug}`} className="hover:text-[#065f46] transition-colors">
                    {doc.fullName}
                  </Link>
                </h3>
                <p className="text-sm font-medium text-[#065f46] mb-4">{doc.specialty}</p>
                
                <p className="text-sm text-[#6b7280] line-clamp-3 mb-6 flex-1">
                  {doc.bio}
                </p>

                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-1.5 text-[#6b7280]">
                      <Clock className="h-4 w-4 text-[#065f46]" />
                      <span>{doc.experience} năm KN</span>
                    </div>
                    <div className="font-semibold text-[#1a1a1a]">
                      {formatCurrency(doc.consultFee)}
                    </div>
                  </div>
                  
                  <Link 
                    href={`/dat-lich?doctor=${doc.id}`}
                    className="btn-outline w-full justify-center text-sm py-2.5"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Đặt lịch khám
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/bac-si" className="btn-primary">
            Xem tất cả bác sĩ
          </Link>
        </div>
      </div>
    </section>
  );
}
