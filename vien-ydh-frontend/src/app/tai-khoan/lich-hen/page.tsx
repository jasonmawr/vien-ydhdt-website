"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar, Clock, User, Stethoscope, MapPin, LogOut,
  RefreshCw, PlusCircle, AlertCircle, CheckCircle, XCircle, Loader2
} from "lucide-react";
import Link from "next/link";

const API = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

interface Appointment {
  id: string;
  doctorName?: string;
  departmentName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  stt?: number;
  status: string;
  symptoms?: string;
}

type TabKey = "upcoming" | "completed" | "cancelled";

const STATUS_LABEL: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: "Chờ khám",   color: "bg-amber-100 text-amber-700", icon: <Clock className="w-3.5 h-3.5" /> },
  completed: { label: "Đã khám",    color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: "Đã hủy",     color: "bg-red-100 text-red-600", icon: <XCircle className="w-3.5 h-3.5" /> },
  success:   { label: "Thành công", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

function formatDate(d?: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return d; }
}

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("patient_token");
    const info = localStorage.getItem("patient_info");
    if (!token) { router.replace("/tai-khoan/dang-nhap"); return; }
    if (info) setPatient(JSON.parse(info));
    loadAppointments(token);
  }, [router]);

  const loadAppointments = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/patient/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) setAppointments(data.data || []);
    } catch {
      toast.error("Không thể tải lịch hẹn");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("patient_token");
    localStorage.removeItem("patient_info");
    router.push("/tai-khoan/dang-nhap");
  }

  async function handleCancel(id: string) {
    if (!confirm("Bạn có chắc muốn hủy lịch hẹn này?")) return;
    const token = localStorage.getItem("patient_token");
    if (!token) return;
    setCancelling(id);
    try {
      const res = await fetch(`${API}/api/patient/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã hủy lịch hẹn thành công");
        loadAppointments(token);
      } else {
        toast.error(data.error || "Không thể hủy lịch hẹn");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setCancelling(null);
    }
  }

  const filtered = appointments.filter(a => {
    const s = a.status?.toLowerCase();
    if (activeTab === "upcoming") return s === "pending" || s === "success";
    if (activeTab === "completed") return s === "completed";
    if (activeTab === "cancelled") return s === "cancelled";
    return true;
  });

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "upcoming",  label: "Sắp tới",  count: appointments.filter(a => ["pending","success"].includes(a.status?.toLowerCase())).length },
    { key: "completed", label: "Đã khám",  count: appointments.filter(a => a.status?.toLowerCase() === "completed").length },
    { key: "cancelled", label: "Đã hủy",   count: appointments.filter(a => a.status?.toLowerCase() === "cancelled").length },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            Xin chào, {patient?.fullName || patient?.phone || "Bệnh nhân"}
          </h1>
          <p className="text-stone-500 text-sm mt-1">Quản lý lịch hẹn khám bệnh của bạn</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/tai-khoan/thong-tin"
            className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-800 border border-stone-200 rounded-lg px-3 py-2"
          >
            <User className="w-4 h-4" /> Thông tin
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 border border-red-100 rounded-lg px-3 py-2"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-6 gap-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.key
                ? "bg-[#109173] text-white"
                : "text-stone-600 hover:text-stone-800 hover:bg-stone-50"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${
                activeTab === tab.key ? "bg-white/20" : "bg-stone-100"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#109173]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-stone-200 mx-auto mb-4" />
          <p className="text-stone-500 font-medium">Không có lịch hẹn nào</p>
          <p className="text-stone-400 text-sm mt-1">
            {activeTab === "upcoming" ? "Bạn chưa có lịch hẹn sắp tới" : "Không có dữ liệu"}
          </p>
          <Link
            href="/dat-lich"
            className="inline-flex items-center gap-2 mt-6 bg-[#109173] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0d7a61] transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Đặt lịch ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(appt => {
            const statusInfo = STATUS_LABEL[appt.status?.toLowerCase()] || STATUS_LABEL.pending;
            const isUpcoming = ["pending", "success"].includes(appt.status?.toLowerCase());

            return (
              <div key={appt.id} className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-stone-800 text-base">
                        {appt.doctorName || "Bác sĩ trực"}
                      </h3>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-stone-500 text-sm mt-0.5 flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5" />
                      {appt.departmentName || "Khoa khám"}
                    </p>
                  </div>
                  {appt.stt && (
                    <div className="text-center bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 ml-4 shrink-0">
                      <div className="text-xs text-emerald-600 font-medium">STT</div>
                      <div className="text-2xl font-black text-emerald-700">{appt.stt}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-stone-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{formatDate(appt.appointmentDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{appt.appointmentTime || "Theo lịch"}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                    <span className="text-xs">273 - 275 Nguyễn Văn Trỗi, Phường 10, Quận Phú Nhuận, TP. Hồ Chí Minh</span>
                  </div>
                </div>

                {isUpcoming && (
                  <div className="flex gap-2 pt-3 border-t border-stone-50">
                    <button
                      onClick={() => handleCancel(appt.id)}
                      disabled={cancelling === appt.id}
                      className="flex-1 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-1"
                    >
                      {cancelling === appt.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      Hủy lịch
                    </button>
                    <Link
                      href="/dat-lich"
                      className="flex-1 py-2 text-sm font-medium text-[#109173] bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-center"
                    >
                      Đặt lịch mới
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/dat-lich"
          className="inline-flex items-center gap-2 bg-[#109173] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0d7a61] transition-colors"
        >
          <PlusCircle className="w-5 h-5" /> Đặt lịch hẹn mới
        </Link>
      </div>
    </div>
  );
}
