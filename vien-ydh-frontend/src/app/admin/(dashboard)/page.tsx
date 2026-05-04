import { getAppointments, getAllDoctors, getPosts } from "@/services/api";
import { cookies } from "next/headers";
import { Users, CalendarCheck, FileText, Activity, ShieldCheck, Database, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let appointmentCount = 0;
  let doctorCount = 0;
  let postCount = 0;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";

  try {
    const [appointments, doctors, postsRes] = await Promise.all([
      getAppointments(token, 1000).catch(() => []),
      getAllDoctors().catch(() => []),
      getPosts(undefined, undefined, 1000, 0, true).catch(() => ({ data: [] }))
    ]);
    
    appointmentCount = appointments.length || 0;
    doctorCount = doctors.length || 0;
    postCount = postsRes.data?.length || 0;
  } catch {
    // Backend chưa sẵn sàng
  }

  return (
    <div className="space-y-8">
      {/* Premium Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-stone-900 via-primary-900 to-teal-900 shadow-xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 z-10">
          <div className="text-white max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wide uppercase mb-4">
              <ShieldCheck size={14} className="text-teal-400" />
              Enterprise Management System
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight text-white drop-shadow-sm">
              Hệ thống Quản trị <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-primary-300">Viện Y Dược Học Dân Tộc</span>
            </h1>
            <p className="text-stone-300 text-base md:text-lg max-w-xl">
              Quản lý toàn diện dữ liệu y tế trực tiếp từ mạng lõi HIS Oracle và hệ thống xuất bản Nội dung CMS tốc độ cao.
            </p>
          </div>
          
          <div className="hidden lg:flex flex-col gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Database size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-stone-400 font-medium uppercase">Trạng thái Oracle HIS</p>
                <p className="text-emerald-400 font-bold text-sm flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Đã kết nối</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Zap size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-stone-400 font-medium uppercase">Web CMS (SQLite)</p>
                <p className="text-blue-400 font-bold text-sm flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> Hoạt động</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
          <Activity size={20} className="text-primary-600" />
          Tổng Quan Hệ Thống
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-stone-200 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-stone-500 mb-1 group-hover:text-primary-600 transition-colors">Tổng Lịch Khám</p>
                <h3 className="text-3xl font-bold text-stone-800">{appointmentCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:scale-110 transition-transform">
                <CalendarCheck size={24} />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-stone-200 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-stone-500 mb-1 group-hover:text-green-600 transition-colors">Bác sĩ hiển thị (HIS)</p>
                <h3 className="text-3xl font-bold text-stone-800">{doctorCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-stone-200 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-stone-500 mb-1 group-hover:text-amber-600 transition-colors">Bài viết Tin tức</p>
                <h3 className="text-3xl font-bold text-stone-800">{postCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-stone-200 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-stone-500 mb-1 group-hover:text-purple-600 transition-colors">Cấu trúc Dữ liệu</p>
                <h3 className="text-lg font-bold text-stone-800 mt-1">Dual-DB</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 group-hover:scale-110 transition-transform">
                <Activity size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
