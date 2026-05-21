import Link from "next/link";
import { ArrowRight, Stethoscope, Users, Calendar, Phone, Clock, MapPin, Shield, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const SERVICES = [
  { title: "Khám Nội – YHCT", desc: "Điều trị bệnh nội khoa bằng thuốc Nam, thuốc Bắc và phương pháp cổ truyền.", href: "/dat-lich", icon: "🫀" },
  { title: "Châm cứu & Bấm huyệt", desc: "Giảm đau mãn tính, phục hồi thần kinh theo phương pháp cổ truyền.", href: "/dat-lich", icon: "🪡" },
  { title: "Vật lý trị liệu", desc: "Điện trị liệu, siêu âm, sóng ngắn, tia hồng ngoại, kéo giãn cột sống.", href: "/dat-lich", icon: "⚡" },
  { title: "Cấy chỉ Catgut", desc: "Cấy chỉ tự tiêu vào huyệt đạo, hiệu quả duy trì 2–4 tuần.", href: "/dat-lich", icon: "🧵" },
  { title: "Dược liệu & Thuốc thang", desc: "Bào chế thuốc thang Nam – Bắc theo cổ phương, kiểm nghiệm chất lượng.", href: "/duoc-lieu", icon: "🌿" },
  { title: "Cận lâm sàng", desc: "Xét nghiệm máu, sinh hóa, X-Quang, siêu âm màu, điện tim ECG.", href: "/dat-lich", icon: "🔬" },
  { title: "Tư vấn Dinh dưỡng", desc: "Tư vấn chế độ ăn uống kết hợp Y học cổ truyền cho từng bệnh lý.", href: "/dat-lich", icon: "🥗" },
  { title: "Phụ sản YHCT", desc: "Chăm sóc sức khỏe phụ nữ, thai sản, hậu sản bằng Y học cổ truyền.", href: "/dat-lich", icon: "👶" },
];

const STEPS = [
  { step: "01", title: "Đặt lịch trước", desc: "Đặt lịch online hoặc gọi hotline để chọn bác sĩ và giờ khám." },
  { step: "02", title: "Đến tiếp đón", desc: "Đến đúng giờ, xuất trình thẻ BHYT tại quầy tiếp đón." },
  { step: "03", title: "Khám & Chẩn đoán", desc: "Bác sĩ khám lâm sàng, chỉ định cận lâm sàng nếu cần." },
  { step: "04", title: "Điều trị & Lĩnh thuốc", desc: "Thực hiện điều trị tại viện hoặc nhận đơn thuốc về nhà." },
];

export default function KhamChuaBenhPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-teal-800 text-white py-20 md:py-28">
        <div className="container-site px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
            <Stethoscope className="h-4 w-4 text-teal-300" />
            Dịch vụ y tế
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Khám Chữa Bệnh</h1>
          <p className="text-white/80 text-lg mb-8">
            Kết hợp tinh hoa Y học cổ truyền với thiết bị hiện đại — chăm sóc sức khỏe toàn diện cho người bệnh TP.HCM và cả nước.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dat-lich">
              <Button size="lg" className="bg-accent-500 hover:bg-accent-600 font-bold h-14 px-8 rounded-xl">
                <Calendar className="mr-2 h-5 w-5" /> Đặt Lịch Khám
              </Button>
            </Link>
            <Link href="/bac-si">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 h-14 px-8 rounded-xl">
                <Users className="mr-2 h-5 w-5" /> Xem Bác Sĩ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-stone-100">
        <div className="container-site px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              ["253+", "Bác sĩ & Chuyên gia"],
              ["50+", "Năm kinh nghiệm"],
              ["100K+", "Lượt khám/năm"],
              ["8", "Chuyên khoa"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-3xl font-extrabold text-primary-700">{v}</p>
                <p className="text-stone-500 text-sm mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="container-site px-4">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">Dịch Vụ Khám Chữa Bệnh</h2>
            <p className="text-stone-500">Đa dạng phương pháp điều trị — phù hợp từng bệnh lý và thể trạng</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((svc) => (
              <Link key={svc.title} href={svc.href}
                className="bg-white rounded-3xl border border-stone-100 p-6 hover:shadow-xl hover:border-primary-100 transition-all group"
              >
                <div className="text-4xl mb-4">{svc.icon}</div>
                <h3 className="font-bold text-stone-900 mb-2 group-hover:text-primary-700 transition-colors">{svc.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-4">{svc.desc}</p>
                <span className="text-primary-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Đặt lịch <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-white">
        <div className="container-site px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">Quy Trình Khám Bệnh</h2>
            <p className="text-stone-500">Đơn giản, nhanh chóng, minh bạch</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white text-2xl font-extrabold mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold text-stone-900 mb-2">{s.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-14 bg-stone-50">
        <div className="container-site px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Bảo hiểm y tế", desc: "Tiếp nhận BHYT đúng tuyến và trái tuyến. Hỗ trợ thủ tục nhanh gọn.", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Award, title: "Chất lượng ISO", desc: "Quy trình khám chữa bệnh đạt chuẩn ISO, kiểm tra định kỳ bởi Bộ Y tế.", color: "text-green-600", bg: "bg-green-50" },
              { icon: Star, title: "Thuốc đảm bảo", desc: "Dược liệu nguồn gốc rõ ràng, kiểm nghiệm chất lượng trước khi sử dụng.", color: "text-amber-600", bg: "bg-amber-50" },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-white rounded-3xl border border-stone-100 p-7 flex gap-5">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 mb-1">{title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hours CTA */}
      <section className="py-16 bg-gradient-to-br from-primary-600 to-teal-600 text-white">
        <div className="container-site px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-6">Giờ Tiếp Nhận Bệnh</h2>
              <div className="space-y-3">
                {[
                  ["Thứ 2 – Thứ 6 (Sáng)", "06:00 – 11:30"],
                  ["Thứ 2 – Thứ 6 (Chiều)", "13:00 – 16:30"],
                  ["Thứ 7, Chủ nhật", "07:00 – 11:30"],
                ].map(([l, t]) => (
                  <div key={l} className="flex justify-between items-center bg-white/10 rounded-xl px-5 py-3">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-teal-200" /> {l}
                    </span>
                    <span className="font-bold text-teal-200">{t}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3 text-white/80">
                <MapPin className="h-5 w-5 shrink-0" />
                <span>273-275 Nam Kỳ Khởi Nghĩa, Phường 7, Quận 3, TP.HCM</span>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Đặt Lịch Khám Ngay</h2>
              <p className="text-white/80 mb-6">Không cần xếp hàng — chủ động thời gian khám bệnh</p>
              <div className="space-y-3">
                <Link href="/dat-lich" className="block">
                  <Button size="lg" className="w-full bg-white text-primary-700 hover:bg-white/90 font-bold h-14 rounded-xl">
                    <Calendar className="mr-2 h-5 w-5" /> Đặt Lịch Online
                  </Button>
                </Link>
                <a href="tel:0964392632" className="block">
                  <Button size="lg" variant="outline" className="w-full border-white/40 text-white hover:bg-white/10 h-12 rounded-xl">
                    <Phone className="mr-2 h-4 w-4" /> Hotline: 0964 392 632
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
