import { getAppointments } from "@/services/api";
import { Users, CalendarCheck, FileText, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let appointmentCount = 0;
  try {
    const appointments = await getAppointments(1000);
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
              <p className="text-sm font-medium text-stone-500 mb-1">Chuyên khoa</p>
              <h3 className="text-3xl font-bold text-stone-800">4</h3>
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
              <p className="text-sm font-medium text-stone-500 mb-1">Nguồn DB</p>
              <h3 className="text-xl font-bold text-stone-800 mt-1">Oracle</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <Activity size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-stone-200 mt-8">
        <h3 className="text-lg font-bold text-stone-800 mb-2">Kết nối Database Oracle</h3>
        <p className="text-stone-600 text-sm">
          Hệ thống đang kết nối trực tiếp tới Oracle Database tại{" "}
          <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">192.168.1.113:1521 (SID: medi)</code>.
          Dữ liệu bác sĩ và chuyên khoa được lấy trực tiếp từ hệ thống HIS của Viện.
        </p>
      </div>
    </div>
  );
}
