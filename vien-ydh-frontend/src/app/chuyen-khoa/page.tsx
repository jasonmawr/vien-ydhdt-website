"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, Stethoscope, Leaf, Activity, HeartPulse, Microscope, FlaskConical, Salad, Baby, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDepartments, getAllDoctors, type DepartmentDTO } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

// Map chuyên khoa → icon + màu
const DEPT_META: Record<string, { icon: React.ElementType; color: string; bg: string; description: string }> = {
  default: { icon: Stethoscope, color: "text-primary-600", bg: "bg-primary-50", description: "Dịch vụ khám chữa bệnh chuyên nghiệp." },
  "nội": { icon: HeartPulse, color: "text-rose-600", bg: "bg-rose-50", description: "Khám và điều trị các bệnh nội khoa bằng Y học cổ truyền, thuốc thang dân tộc." },
  "ngoại": { icon: Activity, color: "text-blue-600", bg: "bg-blue-50", description: "Can thiệp ngoại khoa kết hợp phương pháp YHCT giảm đau và phục hồi." },
  "nhi": { icon: Baby, color: "text-yellow-600", bg: "bg-yellow-50", description: "Chăm sóc sức khỏe trẻ em bằng thuốc Nam nhẹ lành, an toàn cho trẻ nhỏ." },
  "sản": { icon: Leaf, color: "text-teal-600", bg: "bg-teal-50", description: "Chăm sóc sức khỏe phụ nữ, thai sản, hậu sản bằng y học cổ truyền." },
};

function getDeptMeta(name: string) {
  const key = Object.keys(DEPT_META).find((k) => k !== "default" && name.toLowerCase().includes(k));
  return DEPT_META[key || "default"];
}

// Các dịch vụ nổi bật (tĩnh, bổ sung cho HIS)
const FEATURED_SERVICES = [
  { icon: Leaf, title: "Châm cứu & Bấm huyệt", desc: "Điều trị đau mãn tính, phục hồi thần kinh bằng châm cứu truyền thống.", color: "text-teal-600", bg: "bg-teal-50", href: "/dat-lich" },
  { icon: Activity, title: "Vật lý trị liệu", desc: "Siêu âm trị liệu, điện trị liệu, sóng ngắn, tia hồng ngoại.", color: "text-blue-600", bg: "bg-blue-50", href: "/dat-lich" },
  { icon: FlaskConical, title: "Cấy chỉ Catgut", desc: "Cấy chỉ tự tiêu vào huyệt đạo, hiệu quả kéo dài 2–4 tuần.", color: "text-purple-600", bg: "bg-purple-50", href: "/dat-lich" },
  { icon: Microscope, title: "Cận lâm sàng", desc: "Xét nghiệm máu, sinh hóa, X-Quang, siêu âm màu, điện tim.", color: "text-indigo-600", bg: "bg-indigo-50", href: "/dat-lich" },
  { icon: Salad, title: "Dược liệu & Thuốc thang", desc: "Bào chế và cung cấp thuốc thang Nam-Bắc theo cổ phương.", color: "text-green-600", bg: "bg-green-50", href: "/duoc-lieu" },
  { icon: Apple, title: "Tư vấn Dinh dưỡng", desc: "Tư vấn dinh dưỡng lâm sàng kết hợp với Y học cổ truyền.", color: "text-amber-600", bg: "bg-amber-50", href: "/dat-lich" },
];

export default function ChuyenKhoaPage() {
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [doctorCounts, setDoctorCounts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getDepartments(), getAllDoctors()])
      .then(([deptsResult, docsResult]) => {
        const depts = deptsResult.status === 'fulfilled' ? deptsResult.value || [] : [];
        const docs = docsResult.status === 'fulfilled' ? docsResult.value || [] : [];
        setDepartments(depts);
        const counts: Record<number, number> = {};
        docs.forEach((d) => { if (d.departmentId) counts[d.departmentId] = (counts[d.departmentId] || 0) + 1; });
        setDoctorCounts(counts);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-teal-800 text-white py-20 md:py-28">
        <div className="container-site px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
              <Stethoscope className="h-4 w-4 text-teal-300" />
              Hệ thống chuyên khoa
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Các Khoa & Dịch Vụ</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Hệ thống khoa phòng đầy đủ, kết hợp tinh hoa Y học cổ truyền và thiết bị hiện đại,
              phục vụ nhu cầu khám chữa bệnh đa dạng của bệnh nhân.
            </p>
          </motion.div>
        </div>
      </section>

      {/* HIS Departments */}
      <section className="py-14">
        <div className="container-site px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">Chuyên Khoa Khám Bệnh</h2>
            <p className="text-stone-500">Đặt lịch theo chuyên khoa phù hợp với triệu chứng của bạn</p>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-3xl" />)}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {departments.map((dept) => {
                const meta = getDeptMeta(dept.name);
                const Icon = meta.icon;
                const count = doctorCounts[dept.id] || 0;
                return (
                  <motion.div
                    key={dept.id}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="bg-white rounded-3xl border border-stone-100 p-7 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all group"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${meta.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-7 w-7 ${meta.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-primary-700 transition-colors">
                      Chuyên khoa {dept.name}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed mb-4">{meta.description}</p>
                    {count > 0 && (
                      <p className="text-xs text-stone-400 flex items-center gap-1.5 mb-4">
                        <Users className="h-3.5 w-3.5" /> {count} bác sĩ
                      </p>
                    )}
                    <Link href={`/dat-lich/chuyen-khoa?dept=${dept.id}`}>
                      <Button size="sm" className={`w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold`}>
                        Đặt Lịch <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured services */}
      <section className="py-14 bg-white">
        <div className="container-site px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">Dịch Vụ Nổi Bật</h2>
            <p className="text-stone-500">Các phương pháp điều trị chuyên biệt theo Y học cổ truyền</p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURED_SERVICES.map((svc) => {
              const Icon = svc.icon;
              return (
                <motion.div
                  key={svc.title}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                  className="group bg-stone-50 hover:bg-white rounded-3xl border border-stone-200 hover:border-primary-200 p-7 hover:shadow-lg transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl ${svc.bg} flex items-center justify-center mb-5`}>
                    <Icon className={`h-6 w-6 ${svc.color}`} />
                  </div>
                  <h3 className="font-bold text-stone-900 mb-2 group-hover:text-primary-700 transition-colors">{svc.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed mb-5">{svc.desc}</p>
                  <Link href={svc.href} className={`text-sm font-bold ${svc.color} flex items-center gap-1 hover:gap-2 transition-all`}>
                    Tìm hiểu thêm <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-site px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-4">Đặt Lịch Khám Ngay Hôm Nay</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Chủ động thời gian khám bệnh — không phải chờ đợi, không cần đến sớm xếp hàng.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/dat-lich">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-white/90 font-bold h-14 px-8 rounded-xl">
                  Đặt Lịch Online
                </Button>
              </Link>
              <Link href="/bac-si">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 h-14 px-8 rounded-xl">
                  Xem Đội Ngũ Bác Sĩ
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
