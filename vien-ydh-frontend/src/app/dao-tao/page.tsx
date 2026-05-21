import Link from "next/link";
import { GraduationCap, BookOpen, Users, Calendar, ArrowRight, Award, Globe, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const PROGRAMS = [
  {
    title: "Chỉ đạo tuyến",
    desc: "Hỗ trợ kỹ thuật, chuyển giao công nghệ cho các tuyến y tế cơ sở và địa phương trên toàn quốc.",
    icon: Globe,
    color: "text-blue-600",
    bg: "bg-blue-50",
    items: ["Đào tạo bác sĩ tuyến cơ sở", "Chuyển giao kỹ thuật YHCT", "Hỗ trợ thiết lập khoa YHCT", "Kiểm tra, giám sát định kỳ"],
  },
  {
    title: "Đào tạo liên tục",
    desc: "Cập nhật kiến thức và kỹ năng chuyên môn cho cán bộ y tế trong và ngoài viện.",
    icon: BookOpen,
    color: "text-green-600",
    bg: "bg-green-50",
    items: ["Khóa ngắn hạn châm cứu", "Vật lý trị liệu nâng cao", "Bào chế dược liệu", "Tư vấn dinh dưỡng YHCT"],
  },
  {
    title: "Cơ sở thực hành",
    desc: "Nơi thực hành lâm sàng cho sinh viên y khoa, dược khoa các trường Đại học.",
    icon: GraduationCap,
    color: "text-purple-600",
    bg: "bg-purple-50",
    items: ["Thực hành lâm sàng Y khoa", "Thực hành Dược lâm sàng", "Nghiên cứu khoa học", "Báo cáo chuyên đề"],
  },
];

const PARTNERS = [
  "Đại học Y Dược TP.HCM",
  "Đại học Y khoa Phạm Ngọc Thạch",
  "Học viện Y Dược học cổ truyền Việt Nam",
  "Trường ĐH Nguyễn Tất Thành",
  "Bệnh viện Đại học Y Dược TP.HCM",
  "Sở Y tế TP.HCM",
];

export default function DaoTaoPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-teal-800 text-white py-20 md:py-28">
        <div className="container-site px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
            <GraduationCap className="h-4 w-4 text-teal-300" />
            Đào tạo & Chỉ đạo tuyến
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Đào Tạo – Chỉ Đạo Tuyến</h1>
          <p className="text-white/80 text-lg">
            Viện Y Dược Học Dân Tộc là cơ sở thực hành và đào tạo Y học cổ truyền hàng đầu tại TP.HCM, đóng góp vào công tác chăm sóc sức khỏe nhân dân.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-stone-100">
        <div className="container-site px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              ["1,000+", "Lượt đào tạo/năm"],
              ["50+", "Trường liên kết"],
              ["30+", "Tỉnh được hỗ trợ"],
              ["50+", "Năm kinh nghiệm"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-3xl font-extrabold text-primary-700">{v}</p>
                <p className="text-stone-500 text-sm mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16">
        <div className="container-site px-4">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">Chương Trình Đào Tạo</h2>
            <p className="text-stone-500">Đa dạng hình thức đào tạo — từ ngắn hạn đến dài hạn, lý thuyết đến thực hành</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {PROGRAMS.map(({ icon: Icon, title, desc, color, bg, items }) => (
              <div key={title} className="bg-white rounded-3xl border border-stone-100 p-8 hover:shadow-xl hover:border-primary-100 transition-all">
                <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-5`}>
                  <Icon className={`h-7 w-7 ${color}`} />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-5">{desc}</p>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-stone-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-14 bg-white">
        <div className="container-site px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">Đối Tác Đào Tạo</h2>
            <p className="text-stone-500">Hợp tác với các trường Đại học và cơ sở y tế uy tín</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {PARTNERS.map((p) => (
              <div key={p} className="bg-stone-50 rounded-2xl border border-stone-100 px-6 py-4 flex items-center gap-3">
                <Award className="h-5 w-5 text-primary-500 shrink-0" />
                <span className="font-medium text-stone-700 text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration */}
      <section className="py-16 bg-gradient-to-br from-primary-600 to-teal-600 text-white">
        <div className="container-site px-4 text-center max-w-2xl">
          <FileText className="h-12 w-12 mx-auto mb-4 text-teal-200" />
          <h2 className="text-3xl font-bold mb-4">Đăng Ký Đào Tạo</h2>
          <p className="text-white/80 mb-8">
            Liên hệ phòng Đào tạo để biết thông tin chi tiết về các khóa học, lịch khai giảng và điều kiện tham dự.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/lien-he">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-white/90 font-bold h-14 px-8 rounded-xl">
                <Users className="mr-2 h-5 w-5" /> Liên Hệ Đăng Ký
              </Button>
            </Link>
            <a href="tel:02838443047">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 h-14 px-8 rounded-xl">
                Gọi: 028 3844 3047
              </Button>
            </a>
          </div>
          <p className="text-white/60 text-sm mt-6 flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            Phòng Đào tạo tiếp nhận hồ sơ: Thứ 2 – Thứ 6, 8:00 – 16:00
          </p>
        </div>
      </section>
    </div>
  );
}
