import { getAppointments } from "@/services/api";
import { cookies } from "next/headers";
import { Users, CalendarCheck, FileText, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let appointmentCount = 0;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";

  try {
    const appointments = await getAppointments(token, 1000);
    appointmentCount = appointments.length;
  } catch {
    // Backend chưa sẵn sàng
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-stone-800">Tổng Quan Hệ Thống</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-stone-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-stone-500 mb-1">Tổng Lịch Khám</p>
              <h3 className="text-3xl font-bold text-stone-800">{appointmentCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <CalendarCheck size={24} />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-stone-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-stone-500 mb-1">Bác sĩ trong hệ thống</p>
              <h3 className="text-3xl font-bold text-stone-800">253</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-stone-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-stone-500 mb-1">Bài viết Tin tức</p>
              <h3 className="text-3xl font-bold text-stone-800">Hoạt động</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <FileText size={24} />
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-stone-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-stone-500 mb-1">Cấu trúc Dữ liệu</p>
              <h3 className="text-lg font-bold text-stone-800 mt-1">Dual-DB</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <Activity size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-stone-200 mt-8">
        <h3 className="text-lg font-bold text-stone-800 mb-2">Hệ Thống Dual-Database (Bảo Mật Cao)</h3>
        <p className="text-stone-600 text-sm leading-relaxed">
          - <strong>Oracle HIS:</strong> Đang kết nối trực tiếp tại <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">192.168.1.113:1521 (SID: medi)</code> để đọc dữ liệu Bác sĩ, Chuyên khoa, Bảng giá và Ghi Lịch khám bệnh.<br/>
          - <strong>Web CMS (SQLite):</strong> Quản lý toàn bộ nội dung bài viết tin tức, thiết lập trang web để đảm bảo tách biệt tải và bảo vệ dữ liệu Y tế.
        </p>
      </div>
    </div>
  );
}
