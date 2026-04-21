import Link from "next/link";
import { ArrowRight, Leaf, Activity, Stethoscope, Heart, Brain, Syringe, Eye, Bone } from "lucide-react";
import { DEPARTMENTS_DATA } from "@/services/mockData";

const ICONS: Record<string, any> = {
  Stethoscope,
  Activity,
  Heart,
  Brain,
  Syringe,
  Eye,
  Bone,
  ClipboardPlus: Leaf,
};

export default function FeaturedServices() {
  return (
    <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-gray-50">
      <div className="container-site">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-8 h-1 bg-primary-600 rounded-full"></span>
              <span className="text-sm font-bold uppercase tracking-widest text-primary-700">Chuyên khoa</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Đa dạng chuyên khoa điều trị
            </h2>
          </div>
          <Link
            href="/chuyen-khoa"
            className="inline-flex items-center gap-2 font-semibold text-primary-700 hover:text-primary-800 group"
          >
            <span>Xem tất cả</span>
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 group-hover:bg-primary-200 transition-colors">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {DEPARTMENTS_DATA.map((dept) => {
            const IconComponent = ICONS[dept.icon] || Leaf;

            return (
              <div
                key={dept.id}
                className="group flex flex-col h-full rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-5 flex justify-between items-start">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white">
                    <IconComponent className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">{dept.doctorCount} Bác sĩ</span>
                </div>

                <div className="flex flex-1 flex-col">
                  <h3 className="mb-3 font-sans text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-600">
                    {dept.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <Link
                      href={`/chuyen-khoa/${dept.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 transition-all hover:text-primary-800"
                    >
                      <span>Tìm hiểu thêm</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
