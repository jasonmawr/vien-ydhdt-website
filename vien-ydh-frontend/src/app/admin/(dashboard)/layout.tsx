"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, FileText, Settings, Users, User, Terminal, Image, BarChart2, ShieldCheck, Star, MessageSquare, HelpCircle } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";

  return (
    <div className="flex min-h-screen bg-stone-100">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-950 text-white flex flex-col border-r border-primary-900">
        <div className="p-6 border-b border-primary-900/60">
          <h2 className="text-xl font-bold text-primary-300 tracking-wide uppercase">Viện Y Dược</h2>
          <p className="text-primary-400 text-xs mt-1">Trang Quản Trị Hệ Thống</p>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <Link href="/admin" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${pathname === '/admin' ? 'bg-primary-800 text-white shadow-md font-semibold' : 'text-primary-200 hover:bg-primary-900/50 hover:text-white'}`}>
            <LayoutDashboard size={18} />
            <span>Tổng Quan</span>
          </Link>
          <Link href="/admin/appointments" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${pathname.includes('/appointments') ? 'bg-primary-800 text-white shadow-md font-semibold' : 'text-primary-200 hover:bg-primary-900/50 hover:text-white'}`}>
            <CalendarDays size={18} />
            <span>Lịch Khám</span>
          </Link>
          <Link href="/admin/posts" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${pathname.includes('/posts') ? 'bg-primary-800 text-white shadow-md font-semibold' : 'text-primary-200 hover:bg-primary-900/50 hover:text-white'}`}>
            <FileText size={18} />
            <span>Bài Viết</span>
          </Link>
          <Link href="/admin/categories" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${pathname.includes('/categories') ? 'bg-primary-800 text-white shadow-md font-semibold' : 'text-primary-200 hover:bg-primary-900/50 hover:text-white'}`}>
            <FileText size={18} />
            <span>Danh mục</span>
          </Link>
          <Link href="/admin/patients" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${pathname.includes('/patients') ? 'bg-primary-800 text-white shadow-md font-semibold' : 'text-primary-200 hover:bg-primary-900/50 hover:text-white'}`}>
            <Users size={18} />
            <span>Bệnh Nhân</span>
          </Link>
          <Link href="/admin/doctors" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${pathname.includes('/doctors') ? 'bg-primary-800 text-white shadow-md font-semibold' : 'text-primary-200 hover:bg-primary-900/50 hover:text-white'}`}>
            <User size={18} />
            <span>Hồ sơ Bác sĩ</span>
          </Link>
          <Link href="/admin/media" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${pathname.includes('/media') ? 'bg-primary-800 text-white shadow-md font-semibold' : 'text-primary-200 hover:bg-primary-900/50 hover:text-white'}`}>
            <Image size={18} />
            <span>Thư viện Media</span>
          </Link>
          <Link href="/admin/analytics" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${pathname.includes('/analytics') ? 'bg-primary-800 text-white shadow-md font-semibold' : 'text-primary-200 hover:bg-primary-900/50 hover:text-white'}`}>
            <BarChart2 size={18} />
            <span>Thống kê</span>
          </Link>
          <Link href="/admin/reviews" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${pathname.includes('/reviews') ? 'bg-primary-800 text-white shadow-md font-semibold' : 'text-primary-200 hover:bg-primary-900/50 hover:text-white'}`}>
            <Star size={18} />
            <span>Đánh giá</span>
          </Link>
          <Link href="/admin/chatbot" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${pathname.includes('/chatbot') ? 'bg-primary-800 text-white shadow-md font-semibold' : 'text-primary-200 hover:bg-primary-900/50 hover:text-white'}`}>
            <MessageSquare size={18} />
            <span>AI Chatbot</span>
          </Link>
          <Link href="/admin/qna" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${pathname.includes('/qna') ? 'bg-primary-800 text-white shadow-md font-semibold' : 'text-primary-200 hover:bg-primary-900/50 hover:text-white'}`}>
            <HelpCircle size={18} />
            <span>Hỏi đáp (Q&A)</span>
          </Link>
          <Link href="/admin/users" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${pathname.includes('/users') ? 'bg-primary-800 text-white shadow-md font-semibold' : 'text-primary-200 hover:bg-primary-900/50 hover:text-white'}`}>
            <ShieldCheck size={18} />
            <span>Tài khoản Admin</span>
          </Link>
          <Link href="/admin/logs" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${pathname.includes('/logs') ? 'bg-primary-800 text-white shadow-md font-semibold' : 'text-primary-200 hover:bg-primary-900/50 hover:text-white'}`}>
            <Terminal size={18} />
            <span>System Logs</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-primary-900">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-primary-200 hover:bg-primary-900/50 hover:text-white transition-all duration-200">
            <Settings size={18} />
            <span>Cài Đặt</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-stone-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 pr-4 border-r border-stone-200">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="text-stone-600 font-medium">Admin</span>
            </div>
            <LogoutButton />
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
