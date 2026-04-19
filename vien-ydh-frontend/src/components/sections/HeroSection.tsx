import Link from "next/link";
import { Calendar, ShieldPlus, ChevronRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#065f46] text-white">
      {/* Background Pattern / Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-white blur-3xl"></div>
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#d97706] blur-3xl"></div>
      </div>

      <div className="container-site relative z-10 py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          
          {/* Content Left */}
          <div className="max-w-2xl animate-fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-[#a7f3d0] backdrop-blur-sm">
              <ShieldPlus className="h-4 w-4" />
              <span>Hơn 50 năm chăm sóc sức khỏe cộng đồng</span>
            </div>
            
            <h1 className="mb-6 font-heading text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl text-white">
              Tinh hoa <span className="text-[#fcd34d]">Y học Cổ truyền</span> <br className="hidden sm:block" />
              Chăm sóc sức khỏe toàn diện
            </h1>
            
            <p className="mb-8 text-lg leading-relaxed text-emerald-50 sm:text-xl">
              Viện Y Dược Học Dân Tộc tự hào mang đến các liệu pháp điều trị tự nhiên, 
              kết hợp hài hòa giữa y học cổ truyền dân tộc và khoa học kỹ thuật hiện đại.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/dat-lich" className="btn-accent text-lg shadow-lg shadow-amber-900/20 px-8 py-4">
                <Calendar className="h-5 w-5" />
                Đặt lịch khám ngay
              </Link>
              <Link href="/chuyen-khoa" className="btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white px-8 py-4">
                Tìm hiểu chuyên khoa
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm font-medium text-emerald-100/80">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full border-2 border-[#065f46] bg-emerald-300"></div>
                  <div className="h-8 w-8 rounded-full border-2 border-[#065f46] bg-emerald-400"></div>
                  <div className="h-8 w-8 rounded-full border-2 border-[#065f46] bg-emerald-500"></div>
                </div>
                <span>120+ Bác sĩ giỏi</span>
              </div>
              <div className="h-4 w-px bg-white/20"></div>
              <div>Hỗ trợ BHYT</div>
            </div>
          </div>

          {/* Image Right */}
          <div className="relative hidden lg:block animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative mx-auto w-full max-w-lg aspect-square rounded-[2rem] bg-gradient-to-tr from-emerald-800 to-emerald-600 p-2 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Bác sĩ Viện Y Dược Học Dân Tộc đang khám bệnh" 
                className="w-full h-full object-cover rounded-[1.75rem] opacity-90 mix-blend-overlay"
              />
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-6 shadow-xl w-64 text-emerald-900 -rotate-3">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <ShieldPlus className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Uy tín</p>
                    <p className="text-sm text-emerald-600">Hàng đầu Việt Nam</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
