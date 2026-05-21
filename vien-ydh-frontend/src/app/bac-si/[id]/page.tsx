import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar, Stethoscope, Award, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDoctorById, getDoctorImageUrl, getAllDoctors, getDoctorReviews } from "@/services/api";
import { getLocale } from "next-intl/server";
import { translateSpecialtyName } from "@/lib/translations";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const doctor = await getDoctorById(id);
  if (!doctor) return { title: "Bác sĩ không tồn tại" };
  return {
    title: `${doctor.degree ? doctor.degree + " " : ""}${doctor.fullName} - Viện Y Dược Học Dân Tộc`,
    description: `Thông tin và lịch khám của ${doctor.fullName}, chuyên gia ${doctor.departmentName || "Y học cổ truyền"} tại Viện Y Dược Học Dân Tộc TP.HCM.`,
  };
}

export default async function DoctorDetailPage(props: Props) {
  const { id } = await props.params;
  const locale = await getLocale();
  const [doctor, allDoctors, reviewData] = await Promise.all([
    getDoctorById(id),
    getAllDoctors(8).catch(() => []),
    getDoctorReviews(id).catch(() => ({ reviews: [], stats: { total: 0, avg_rating: 0 } })),
  ]);

  if (!doctor) notFound();

  const related = allDoctors
    .filter((d) => d.id !== id && d.departmentId === doctor.departmentId)
    .slice(0, 4);

  const specialty = translateSpecialtyName(doctor.departmentName || doctor.specialty || "Y học cổ truyền", locale);

  return (
    <>
      {/* JSON-LD Physician structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Physician",
            name: doctor.fullName,
            honorificPrefix: doctor.degree,
            medicalSpecialty: specialty,
            worksFor: {
              "@type": "MedicalOrganization",
              name: "Viện Y Dược Học Dân Tộc TP.HCM",
              url: "https://vienydhdt.gov.vn",
            },
            image: getDoctorImageUrl(doctor.id),
            url: `https://vienydhdt.gov.vn/bac-si/${doctor.id}`,
          }),
        }}
      />

      <div className="min-h-screen bg-stone-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-stone-200 sticky top-16 z-40">
          <div className="container-site px-4 py-3 flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-primary-700 transition-colors">Trang chủ</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/bac-si" className="hover:text-primary-700 transition-colors">Đội ngũ bác sĩ</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-stone-700 font-medium truncate">{doctor.fullName}</span>
          </div>
          <div className="container-site px-4 pb-3">
            <Link href="/bac-si">
              <Button variant="ghost" size="sm" className="text-stone-500 hover:text-primary-700 -ml-3 h-8">
                <ChevronLeft className="mr-1 h-4 w-4" /> Quay lại danh sách bác sĩ
              </Button>
            </Link>
          </div>
        </div>

        <div className="container-site px-4 py-10 max-w-5xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Photo + Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm sticky top-36">
                <div className="relative h-72 w-full bg-gradient-to-br from-primary-50 to-teal-50">
                  <Image
                    src={getDoctorImageUrl(doctor.id)}
                    alt={doctor.fullName}
                    fill
                    sizes="(max-width: 1024px) 100vw, 360px"
                    className="object-cover object-top"
                    priority
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.src = "/images/doctor-placeholder.svg";
                    }}
                  />
                </div>
                <div className="p-6 space-y-4">
                  {doctor.degree && (
                    <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-sm font-bold px-3 py-1.5 rounded-full">
                      <Award className="h-4 w-4" />
                      {doctor.degree}
                    </div>
                  )}
                  <h1 className="text-2xl font-extrabold text-stone-900 leading-tight">{doctor.fullName}</h1>
                  <p className="text-stone-500 text-sm flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary-500 shrink-0" />
                    {specialty}
                  </p>
                  {reviewData.stats.total > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${s <= Math.round(reviewData.stats.avg_rating) ? "fill-amber-400 text-amber-400" : "text-stone-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-amber-600">{reviewData.stats.avg_rating.toFixed(1)}</span>
                      <span className="text-xs text-stone-400">({reviewData.stats.total} đánh giá)</span>
                    </div>
                  )}
                  <div className="pt-4 space-y-3 border-t border-stone-100">
                    <Link href={`/dat-lich/bac-si?doctor=${doctor.id}`} className="block">
                      <Button className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 font-bold h-12">
                        <Calendar className="mr-2 h-5 w-5" />
                        Đặt Lịch Khám Ngay
                      </Button>
                    </Link>
                    <a href="tel:0964392632" className="block">
                      <Button variant="outline" className="w-full rounded-xl border-primary-200 text-primary-700 h-11">
                        <Phone className="mr-2 h-4 w-4" />
                        Gọi Hotline: 0964 392 632
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overview card */}
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-stone-900 mb-6 pb-4 border-b border-stone-100">
                  Thông Tin Chuyên Môn
                </h2>
                <dl className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Họ và tên</dt>
                    <dd className="text-stone-800 font-semibold">{doctor.fullName}</dd>
                  </div>
                  {doctor.degree && (
                    <div>
                      <dt className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Học hàm / Học vị</dt>
                      <dd className="text-stone-800 font-semibold">{doctor.degree}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Chuyên khoa</dt>
                    <dd className="text-stone-800 font-semibold">{specialty}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Giới tính</dt>
                    <dd className="text-stone-800 font-semibold capitalize">
                      {doctor.gender === "male" ? "Nam" : doctor.gender === "female" ? "Nữ" : "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Specialty / Services */}
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-stone-900 mb-6 pb-4 border-b border-stone-100 flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary-500" />
                  Lĩnh Vực Chuyên Môn
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Khám và điều trị bằng Y học cổ truyền",
                    "Châm cứu, xoa bóp, bấm huyệt",
                    "Bào chế thuốc thang dân tộc",
                    "Điều trị phục hồi chức năng",
                    "Tư vấn dinh dưỡng YHCT",
                    "Cấy chỉ catgut huyệt đạo",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5 p-3 bg-stone-50 rounded-xl text-sm text-stone-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Working hours */}
              <div className="bg-gradient-to-br from-primary-600 to-teal-600 rounded-3xl p-8 text-white">
                <h2 className="text-xl font-bold mb-6 pb-4 border-b border-white/20">Lịch Khám Bệnh</h2>
                <div className="space-y-3 text-white/90">
                  <div className="flex justify-between items-center bg-white/10 rounded-xl px-5 py-3">
                    <span className="font-medium">Thứ 2 – Thứ 6 (Buổi sáng)</span>
                    <span className="font-bold text-teal-200">06:00 – 11:30</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/10 rounded-xl px-5 py-3">
                    <span className="font-medium">Thứ 2 – Thứ 6 (Buổi chiều)</span>
                    <span className="font-bold text-teal-200">13:00 – 16:30</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/10 rounded-xl px-5 py-3">
                    <span className="font-medium">Thứ 7, Chủ Nhật</span>
                    <span className="font-bold text-teal-200">07:00 – 11:30</span>
                  </div>
                </div>
                <p className="text-white/60 text-xs mt-4">
                  * Lịch khám có thể thay đổi theo ngày lễ. Đặt lịch trước để đảm bảo khung giờ mong muốn.
                </p>
              </div>

              {/* Patient Reviews */}
              {reviewData.stats.total > 0 && (
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
                  <h2 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    Đánh Giá Từ Bệnh Nhân
                  </h2>
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-stone-100">
                    <span className="text-5xl font-black text-stone-900">{reviewData.stats.avg_rating.toFixed(1)}</span>
                    <div>
                      <div className="flex mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-5 w-5 ${s <= Math.round(reviewData.stats.avg_rating) ? "fill-amber-400 text-amber-400" : "text-stone-200"}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-stone-500">{reviewData.stats.total} đánh giá</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {reviewData.reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="p-4 bg-stone-50 rounded-2xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3.5 w-3.5 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-stone-400">
                            {new Date(review.created_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-stone-600 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 text-center">
                <h3 className="text-xl font-bold text-stone-900 mb-2">Đặt Lịch Khám Với {doctor.fullName}</h3>
                <p className="text-stone-500 mb-6 text-sm">Chủ động thời gian — Không phải chờ đợi lâu</p>
                <Link href={`/dat-lich/bac-si?doctor=${doctor.id}`}>
                  <Button size="lg" className="rounded-xl bg-primary-600 hover:bg-primary-700 font-bold h-14 px-10 text-base shadow-lg">
                    <Calendar className="mr-2 h-5 w-5" />
                    Đặt Lịch Ngay
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Related doctors */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-stone-900 mb-6">Bác Sĩ Cùng Chuyên Khoa</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
                {related.map((doc) => (
                  <Link key={doc.id} href={`/bac-si/${doc.id}`}
                    className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-lg hover:border-primary-100 transition-all group"
                  >
                    <div className="relative h-40 bg-gradient-to-br from-primary-50 to-teal-50">
                      <Image
                        src={getDoctorImageUrl(doc.id)}
                        alt={doc.fullName}
                        fill
                        sizes="25vw"
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      {doc.degree && (
                        <span className="text-xs font-bold text-primary-600">{doc.degree} </span>
                      )}
                      <p className="font-bold text-stone-800 text-sm line-clamp-1 group-hover:text-primary-700 transition-colors">{doc.fullName}</p>
                      <p className="text-xs text-stone-400 mt-0.5 truncate">{doc.departmentName || "Y học cổ truyền"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
