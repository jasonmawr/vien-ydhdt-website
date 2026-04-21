import Link from "next/link";
import { LayoutDashboard, CalendarDays, FileText, Settings, Users } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-stone-100">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary-400">Viện Y Dược</h2>
          <p className="text-stone-400 text-sm">Trang Quản Trị</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-stone-800 text-white">
            <LayoutDashboard size={20} />
            <span>Tổng Quan</span>
          </Link>
          <Link href="/admin/appointments" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white transition">
            <CalendarDays size={20} />
            <span>Lịch Khám</span>
          </Link>
          <Link href="/admin/doctors" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white transition">
            <Users size={20} />
            <span>Bác Sĩ</span>
          </Link>
          <Link href="/admin/departments" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white transition">
            <LayoutDashboard size={20} />
            <span>Chuyên Khoa</span>
          </Link>
          <Link href="/admin/herbs" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white transition">
            <FileText size={20} />
            <span>Dược Liệu</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-stone-800">
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white transition">
            <Settings size={20} />
            <span>Cài Đặt</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-stone-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="text-stone-600 font-medium">Admin</span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
