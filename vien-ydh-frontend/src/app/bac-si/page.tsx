"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Users, Filter, ArrowRight, Stethoscope, UserCheck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllDoctors, getDepartments, getDoctorImageUrl, type DoctorDTO, type DepartmentDTO } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "next-intl";
import { translateSpecialtyName } from "@/lib/translations";

const PAGE_SIZE = 12;

const GENDER_LABELS: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  unknown: "",
};

export default function BacSiPage() {
  const locale = useLocale();
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.allSettled([getAllDoctors(), getDepartments()])
      .then(([docsResult, deptsResult]) => {
        if (docsResult.status === 'fulfilled') setDoctors(docsResult.value || []);
        if (deptsResult.status === 'fulfilled') setDepartments(deptsResult.value || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, activeDept]);

  const filtered = doctors.filter(d => {
    const matchSearch = !search || d.fullName.toLowerCase().includes(search.toLowerCase());
    const matchDept = activeDept === null || d.departmentId === activeDept;
    return matchSearch && matchDept;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filtered.length));
  }, [filtered.length]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-linear-to-br from-primary-900 to-teal-800 text-white py-20 md:py-28">
        <div className="container-site px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
              <UserCheck className="h-4 w-4 text-teal-300" />
              Đội ngũ chuyên gia
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Đội Ngũ Bác Sĩ Chuyên Gia
            </h1>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Hơn 253 bác sĩ, chuyên gia Y học cổ truyền hàng đầu với nhiều năm kinh nghiệm
              điều trị, sẵn sàng đồng hành cùng bạn trên hành trình chăm sóc sức khỏe.
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-white/50" />
              <Input
                placeholder="Tìm theo tên bác sĩ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 text-base focus-visible:ring-white/40"
                aria-label="Tìm kiếm bác sĩ"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-site px-4">
          {/* Department filters */}
          <div className="flex items-center gap-2 flex-wrap mb-10" role="group" aria-label="Lọc theo chuyên khoa">
            <div className="flex items-center gap-1.5 text-stone-500 mr-1">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Chuyên khoa:</span>
            </div>
            <button
              onClick={() => setActiveDept(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeDept === null
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-primary-300 hover:text-primary-700"
              }`}
            >
              Tất cả ({doctors.length})
            </button>
            {departments.map(dept => {
              const count = doctors.filter(d => d.departmentId === dept.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={dept.id}
                  onClick={() => setActiveDept(dept.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeDept === dept.id
                      ? "bg-primary-600 text-white shadow-md"
                      : "bg-white text-stone-600 border border-stone-200 hover:border-primary-300 hover:text-primary-700"
                  }`}
                >
                  {translateSpecialtyName(dept.name, locale)} ({count})
                </button>
              );
            })}
          </div>

          {/* Stats bar */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-stone-600 text-sm">
              Hiển thị <span className="font-bold text-primary-700">{visible.length}</span> / {filtered.length} bác sĩ
              {search && <span className="ml-1">cho &ldquo;<strong>{search}</strong>&rdquo;</span>}
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden border border-stone-100">
                  <Skeleton className="h-56 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-9 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-xl font-semibold">Không tìm thấy bác sĩ phù hợp</p>
              <Button variant="ghost" className="mt-4 text-primary-600" onClick={() => { setSearch(""); setActiveDept(null); }}>
                Xóa bộ lọc
              </Button>
            </div>
          ) : (
            <>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.04 } }, hidden: {} }}
                className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {visible.map(doctor => (
                  <motion.div
                    key={doctor.id}
                    variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all group"
                  >
                    {/* Top area: links to doctor profile */}
                    <Link href={`/bac-si/${doctor.id}`} className="block">
                      <div className="relative h-56 w-full bg-linear-to-br from-primary-50 to-teal-50 overflow-hidden">
                        <Image
                          src={getDoctorImageUrl(doctor.id)}
                          alt={doctor.fullName}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/doctor-placeholder.svg";
                          }}
                        />
                        {doctor.gender !== "unknown" && (
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-full text-stone-700 border border-stone-100">
                            {GENDER_LABELS[doctor.gender]}
                          </div>
                        )}
                      </div>
                      <div className="p-5 pb-3">
                        {doctor.degree && (
                          <span className="inline-block bg-primary-50 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                            {doctor.degree}
                          </span>
                        )}
                        <h3 className="font-bold text-stone-900 text-base leading-tight mb-1 group-hover:text-primary-700 transition-colors line-clamp-1">
                          {doctor.fullName}
                        </h3>
                        <p className="text-stone-500 text-sm flex items-center gap-1.5">
                          <Stethoscope className="h-3.5 w-3.5 text-primary-400 shrink-0" />
                          <span className="truncate">{translateSpecialtyName(doctor.departmentName || doctor.specialty || "Y học cổ truyền", locale)}</span>
                        </p>
                      </div>
                    </Link>
                    {/* Bottom: booking button — separate link, NOT inside the card link above */}
                    <div className="px-5 pb-5">
                      <Link
                        href={`/dat-lich/bac-si?doctor=${doctor.id}`}
                        aria-label={`Đặt lịch khám với ${doctor.fullName}`}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm h-9 transition-colors"
                      >
                        Đặt Lịch Khám
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="flex justify-center mt-10">
                {hasMore && (
                  <div className="flex items-center gap-2 text-stone-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Đang tải thêm...</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
