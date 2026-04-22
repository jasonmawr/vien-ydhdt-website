"use client";

import { useEffect, useState } from "react";
import { Search, Calendar, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type AppointmentRecord } from "@/services/api";

export default function AdminPatientsPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/appointments?limit=200");
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data || []);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách bệnh nhân:", error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = appointments.filter(a => 
    a.PATIENT_NAME?.toLowerCase().includes(search.toLowerCase()) || 
    a.PATIENT_PHONE?.includes(search)
  );

  // Group by unique patients using phone number
  const uniquePatients = Array.from(new Map(filtered.map(a => [a.PATIENT_PHONE, a])).values());

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-800">Danh sách Bệnh nhân</h2>
          <p className="text-stone-500 text-sm">
            Quản lý danh sách bệnh nhân đã đặt khám qua website.
            {!isLoading && ` (${uniquePatients.length} bệnh nhân — ${appointments.length} lịch khám)`}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchAppointments}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Tải lại
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
          <Input 
            placeholder="Tìm kiếm tên hoặc số điện thoại..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-lg bg-stone-50 border-stone-200"
          />
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
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-10">Đang tải dữ liệu...</td>
              </tr>
            ) : uniquePatients.length > 0 ? (
              uniquePatients.map(patient => {
                const patientVisits = appointments.filter(a => a.PATIENT_PHONE === patient.PATIENT_PHONE);
                const statusColors: Record<string, string> = {
                  'pending': 'bg-yellow-100 text-yellow-700',
                  'confirmed': 'bg-green-100 text-green-700',
                  'cancelled': 'bg-red-100 text-red-700',
                };
                const statusLabels: Record<string, string> = {
                  'pending': 'Chờ xác nhận',
                  'confirmed': 'Đã xác nhận',
                  'cancelled': 'Đã hủy',
                };
                return (
                  <tr key={patient.PATIENT_PHONE || patient.ID} className="border-b border-stone-100 hover:bg-stone-50/50">
                    <td className="px-4 py-4 font-bold text-stone-900">{patient.PATIENT_NAME}</td>
                    <td className="px-4 py-4 font-medium text-stone-600">{patient.PATIENT_PHONE}</td>
                    <td className="px-4 py-4 flex items-center gap-2 text-stone-600">
                      <Calendar size={14} className="text-stone-400" />
                      {patient.APPOINTMENT_DATE 
                        ? `${patient.APPOINTMENT_DATE} ${patient.APPOINTMENT_TIME || ''}` 
                        : new Date(patient.CREATED_AT).toLocaleDateString('vi-VN')}
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
                  {appointments.length === 0 
                    ? "Chưa có bệnh nhân nào đặt khám. Khi bệnh nhân đặt lịch qua website, thông tin sẽ hiển thị ở đây." 
                    : "Không tìm thấy bệnh nhân phù hợp."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
