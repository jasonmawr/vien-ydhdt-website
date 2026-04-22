import { getAppointments, type AppointmentRecord } from "@/services/api";
import { cookies } from "next/headers";
import { Search, Calendar, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPatientsPage() {
  let appointments: AppointmentRecord[] = [];
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";

  try {
    appointments = await getAppointments(token, 200);
  } catch {
    // Backend chưa sẵn sàng
  }

  // Group by unique patients using phone number
  const uniquePatients = Array.from(
    new Map(appointments.map(a => [a.PATIENT_PHONE, a])).values()
  );

  const statusColors: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-700',
    'pending': 'bg-yellow-100 text-yellow-700',
    'confirmed': 'bg-green-100 text-green-700',
    'CONFIRMED': 'bg-green-100 text-green-700',
    'cancelled': 'bg-red-100 text-red-700',
    'CANCELLED': 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    'PENDING': 'Chờ xác nhận',
    'pending': 'Chờ xác nhận',
    'confirmed': 'Đã xác nhận',
    'CONFIRMED': 'Đã xác nhận',
    'cancelled': 'Đã hủy',
    'CANCELLED': 'Đã hủy',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-800">Danh sách Bệnh nhân</h2>
          <p className="text-stone-500 text-sm">
            Quản lý danh sách bệnh nhân đã đặt khám qua website.
            ({uniquePatients.length} bệnh nhân — {appointments.length} lịch khám)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-stone-600">
          <thead className="bg-stone-50 text-stone-900 font-semibold border-y border-stone-200">
            <tr>
              <th className="px-4 py-3">Bệnh nhân</th>
              <th className="px-4 py-3">Số điện thoại</th>
              <th className="px-4 py-3">Lần khám gần nhất</th>
              <th className="px-4 py-3">Tổng số lần đặt</th>
              <th className="px-4 py-3 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {uniquePatients.length > 0 ? (
              uniquePatients.map(patient => {
                const patientVisits = appointments.filter(a => a.PATIENT_PHONE === patient.PATIENT_PHONE);
                return (
                  <tr key={patient.PATIENT_PHONE || patient.ID} className="border-b border-stone-100 hover:bg-stone-50/50">
                    <td className="px-4 py-4 font-bold text-stone-900">{patient.PATIENT_NAME}</td>
                    <td className="px-4 py-4 font-medium text-stone-600">{patient.PATIENT_PHONE}</td>
                    <td className="px-4 py-4 text-stone-600">
                      {patient.APPOINTMENT_DATE 
                        ? `${patient.APPOINTMENT_DATE} ${patient.APPOINTMENT_TIME || ''}` 
                        : patient.CREATED_AT 
                          ? new Date(patient.CREATED_AT).toLocaleDateString('vi-VN')
                          : '—'}
                    </td>
                    <td className="px-4 py-4 font-bold text-primary-600">
                      {patientVisits.length} lần
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusColors[patient.STATUS] || 'bg-stone-100 text-stone-600'}`}>
                        {statusLabels[patient.STATUS] || patient.STATUS}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-stone-500">
                  Chưa có bệnh nhân nào đặt khám qua website.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
