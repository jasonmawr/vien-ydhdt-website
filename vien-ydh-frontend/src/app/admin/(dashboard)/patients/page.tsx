"use client";

import { useEffect, useState } from "react";
import { Search, Calendar, Phone, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Appointment {
  ID: string;
  PATIENT_NAME: string;
  PATIENT_PHONE: string;
  DEPARTMENT_ID: string;
  APPOINTMENT_DATE: string;
  APPOINTMENT_TIME: string;
  STATUS: string;
  CREATED_AT: string;
}

export default function AdminPatientsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments?limit=100", {
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (error) {
      console.error(error);
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
          <p className="text-stone-500 text-sm">Quản lý danh sách bệnh nhân đã đặt khám qua website.</p>
        </div>
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
                return (
                  <tr key={patient.PATIENT_PHONE} className="border-b border-stone-100 hover:bg-stone-50/50">
                    <td className="px-4 py-4 font-bold text-stone-900">{patient.PATIENT_NAME}</td>
                    <td className="px-4 py-4 font-medium text-stone-600">{patient.PATIENT_PHONE}</td>
                    <td className="px-4 py-4">
                      {patient.APPOINTMENT_DATE} {patient.APPOINTMENT_TIME}
                    </td>
                    <td className="px-4 py-4 font-bold text-primary-600">
                      {patientVisits.length} lần
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                        Đã xác thực
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-stone-500">Không tìm thấy bệnh nhân nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
