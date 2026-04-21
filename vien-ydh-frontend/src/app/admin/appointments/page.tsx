import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-800">Danh Sách Lịch Khám</h2>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-sm">
              <th className="p-4 font-semibold">Bệnh Nhân</th>
              <th className="p-4 font-semibold">Số Điện Thoại</th>
              <th className="p-4 font-semibold">Ngày Đăng Ký</th>
              <th className="p-4 font-semibold">Lý Do Khám</th>
              <th className="p-4 font-semibold">Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-stone-500">
                  Chưa có lịch khám nào trong hệ thống.
                </td>
              </tr>
            ) : (
              appointments.map((apt) => (
                <tr key={apt.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                  <td className="p-4 font-medium text-stone-800">{apt.patientName}</td>
                  <td className="p-4 text-stone-600">{apt.phone}</td>
                  <td className="p-4 text-stone-600">
                    {new Date(apt.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-4 text-stone-600 max-w-xs truncate" title={apt.reason || ""}>
                    {apt.reason || <span className="text-stone-400 italic">Không có</span>}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
