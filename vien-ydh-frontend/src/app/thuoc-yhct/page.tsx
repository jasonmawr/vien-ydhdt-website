import Link from "next/link";
import { Leaf, FlaskConical, Shield, Award, ArrowRight, Phone, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRODUCTS_VIEN = [
  { name: "Cao xương khớp Viện DT", desc: "Giảm đau xương khớp, viêm khớp dạng thấp. Sản xuất theo quy trình GMP.", tag: "Bán chạy" },
  { name: "Thuốc cốm Bình vị DT", desc: "Điều trị viêm loét dạ dày, đại tràng kết hợp Y học cổ truyền.", tag: "Đặc trưng" },
  { name: "Hoàn kỷ cúc địa hoàng", desc: "Bổ thận, sáng mắt, giảm hoa mắt chóng mặt theo cổ phương.", tag: "" },
  { name: "Siro ho Bách bộ DT", desc: "Giảm ho, long đờm an toàn cho mọi độ tuổi.", tag: "" },
  { name: "Thuốc ngâm chân thảo dược", desc: "Thư giãn, lưu thông khí huyết, giảm phù nề bàn chân.", tag: "" },
  { name: "Cao dán thảo dược", desc: "Giảm đau cơ bắp, dán vào huyệt vị để thông kinh lạc.", tag: "" },
];

const PRODUCTS_LIEN_DOANH = [
  { name: "Lục vị địa hoàng hoàn", desc: "Bổ thận âm, điều trị chứng thận hư, đau lưng mỏi gối." },
  { name: "Bát vị quế phụ hoàn", desc: "Bổ thận dương, điều trị liệt dương, tiểu đêm nhiều." },
  { name: "Phụ khang viên", desc: "Hỗ trợ điều trị viêm phụ khoa, ngứa và khí hư bất thường." },
  { name: "An thai thang", desc: "Dưỡng thai, phòng ngừa dọa sẩy thai trong 3 tháng đầu." },
];

export default function ThuocYhctPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-teal-800 text-white py-20 md:py-28">
        <div className="container-site px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
            <Leaf className="h-4 w-4 text-teal-300" />
            Sản phẩm thuốc
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Sản Phẩm Thuốc YHCT</h1>
          <p className="text-white/80 text-lg">
            Thuốc Y học cổ truyền do Viện sản xuất và liên doanh liên kết — đảm bảo chất lượng, nguồn gốc rõ ràng, đạt tiêu chuẩn Bộ Y tế.
          </p>
        </div>
      </section>

      {/* Quality badges */}
      <section className="bg-white border-b border-stone-100">
        <div className="container-site px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              ["GMP", "Tiêu chuẩn sản xuất"],
              ["ISO", "Quản lý chất lượng"],
              ["Bộ Y tế", "Cấp phép lưu hành"],
              ["50+", "Năm kinh nghiệm bào chế"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-extrabold text-primary-700">{v}</p>
                <p className="text-stone-500 text-sm mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Viện sản xuất */}
      <section className="py-16">
        <div className="container-site px-4">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-bold px-3 py-1.5 rounded-full mb-3">
              <FlaskConical className="h-4 w-4" /> Thuốc do Viện sản xuất
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">Sản Phẩm Nội Viện</h2>
            <p className="text-stone-500">Được bào chế theo công thức truyền thống, kết hợp dây chuyền sản xuất hiện đại</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS_VIEN.map((p) => (
              <div key={p.name} className="bg-white rounded-3xl border border-stone-100 p-7 hover:shadow-lg hover:border-primary-100 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-green-600" />
                  </div>
                  {p.tag && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">{p.tag}</span>
                  )}
                </div>
                <h3 className="font-bold text-stone-900 mb-2">{p.name}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Liên doanh */}
      <section className="py-14 bg-white">
        <div className="container-site px-4">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-sm font-bold px-3 py-1.5 rounded-full mb-3">
              <Award className="h-4 w-4" /> Thuốc liên doanh liên kết
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">Sản Phẩm Liên Doanh</h2>
            <p className="text-stone-500">Hợp tác sản xuất và phân phối với các đơn vị dược liệu uy tín trong nước</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {PRODUCTS_LIEN_DOANH.map((p) => (
              <div key={p.name} className="bg-stone-50 rounded-2xl border border-stone-100 p-6 flex gap-4 hover:border-primary-200 hover:bg-white transition-all">
                <CheckCircle className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-stone-900 mb-1">{p.name}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="py-14 bg-stone-50">
        <div className="container-site px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-stone-900">Cam Kết Chất Lượng</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Shield, title: "Dược liệu sạch", desc: "100% dược liệu có nguồn gốc rõ ràng, đã được kiểm nghiệm.", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: FlaskConical, title: "Kiểm nghiệm đầu ra", desc: "Mỗi lô sản phẩm đều qua kiểm nghiệm vi sinh và hóa học.", color: "text-green-600", bg: "bg-green-50" },
              { icon: Award, title: "Số đăng ký BYT", desc: "Tất cả sản phẩm có số đăng ký lưu hành của Bộ Y tế.", color: "text-amber-600", bg: "bg-amber-50" },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-white rounded-2xl border border-stone-100 p-6 text-center">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className="font-bold text-stone-900 mb-1">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-site px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Mua Thuốc Và Tư Vấn</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Liên hệ khoa Dược hoặc đặt lịch khám để bác sĩ kê đơn phù hợp với từng bệnh lý.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dat-lich">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-white/90 font-bold h-14 px-8 rounded-xl">
                Đặt Lịch Tư Vấn <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="tel:02838443047">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 h-14 px-8 rounded-xl">
                <Phone className="mr-2 h-4 w-4" /> 028 3844 3047
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
