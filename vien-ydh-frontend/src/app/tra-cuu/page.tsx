"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Phone, MessageSquare, ChevronRight, CheckCircle2, XCircle, Clock, RefreshCw, LogOut, Calendar, User, Stethoscope, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendPatientOtp, verifyPatientOtp, getPatientAppointments, type PatientAppointment } from "@/services/api";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type Step = "phone" | "otp" | "appointments";

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: typeof CheckCircle2 }> = {
  pending:   { label: "Chờ xác nhận", color: "text-amber-600 bg-amber-50 border-amber-200",  Icon: Clock },
  confirmed: { label: "Đã xác nhận",  color: "text-blue-600 bg-blue-50 border-blue-200",     Icon: CheckCircle2 },
  completed: { label: "Hoàn thành",   color: "text-green-600 bg-green-50 border-green-200",  Icon: CheckCircle2 },
  cancelled: { label: "Đã hủy",       color: "text-red-600 bg-red-50 border-red-200",        Icon: XCircle },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Theo lịch hẹn";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch { return dateStr; }
}

export default function TraCuuPage() {
  const t = useTranslations("search");
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const cancelId = searchParams.get("cancel");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("patient_token") : null;
    if (stored) {
      setToken(stored);
      setStep("appointments");
      fetchAppointments(stored);
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\s/g, "");
    if (!/^(0|\+84)[0-9]{9}$/.test(cleaned)) {
      toast.error("Số điện thoại không hợp lệ (cần 10 chữ số)");
      return;
    }
    setIsLoading(true);
    try {
      const res = await sendPatientOtp(cleaned);
      toast.success(res.message || "Mã OTP đã được gửi qua SMS!");
      setStep("otp");
      setCountdown(60);
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi OTP, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 chữ số OTP");
      return;
    }
    setIsLoading(true);
    try {
      const res = await verifyPatientOtp(phone.replace(/\s/g, ""), otp);
      localStorage.setItem("patient_token", res.token);
      setToken(res.token);
      setStep("appointments");
      await fetchAppointments(res.token);
      toast.success("Xác minh thành công!");
    } catch (err: any) {
      toast.error(err?.message || "Mã OTP không đúng hoặc đã hết hạn");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppointments = async (tkn: string) => {
    setIsLoading(true);
    try {
      const data = await getPatientAppointments(tkn);
      setAppointments(data || []);
    } catch (err: any) {
      if (err?.message?.includes("401") || err?.message?.toLowerCase().includes("unauthorized")) {
        handleLogout();
        toast.error("Phiên đăng nhập hết hạn");
      } else {
        toast.error("Không thể tải lịch hẹn");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("patient_token");
    localStorage.removeItem("patient_user");
    setToken(null);
    setAppointments([]);
    setPhone("");
    setOtp("");
    setStep("phone");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/60 via-white to-teal-50/40 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Search size={14} /> {t("title")}
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-3">Tra Cứu Lịch Hẹn</h1>
          <p className="text-stone-500">{t("subtitle")}</p>
        </div>

        {cancelId && step === "phone" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-amber-800 text-sm flex items-start gap-3">
            <XCircle size={18} className="mt-0.5 shrink-0" />
            <span>Yêu cầu hủy lịch hẹn <strong className="font-mono">{cancelId}</strong>. Vui lòng đăng nhập để xác nhận hủy.</span>
          </div>
        )}

        {step === "phone" && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Phone size={20} className="text-primary-600" />
              </div>
              <div>
                <h2 className="font-bold text-stone-800">Xác minh số điện thoại</h2>
                <p className="text-stone-500 text-sm">Mã OTP 6 số sẽ được gửi qua SMS</p>
              </div>
            </div>
            <Input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder={t("placeholder")}
              className="text-lg py-6 text-center tracking-widest mb-4 font-medium"
              onKeyDown={e => e.key === "Enter" && handleSendOtp()}
              maxLength={11}
            />
            <Button
              onClick={handleSendOtp}
              disabled={isLoading || phone.replace(/\s/g, "").length < 10}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-6 text-base"
            >
              {isLoading
                ? <><RefreshCw size={16} className="animate-spin mr-2" />Đang gửi...</>
                : <>{t("button")} <ChevronRight size={16} className="ml-1" /></>
              }
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <MessageSquare size={20} className="text-teal-600" />
              </div>
              <div>
                <h2 className="font-bold text-stone-800">Nhập mã xác minh</h2>
                <p className="text-stone-500 text-sm">Mã đã gửi đến <strong>{phone}</strong></p>
              </div>
            </div>
            <Input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="• • • • • •"
              className="text-3xl py-6 text-center tracking-[0.6em] font-mono mb-4"
              onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
              maxLength={6}
              autoFocus
            />
            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-base mb-3"
            >
              {isLoading
                ? <><RefreshCw size={16} className="animate-spin mr-2" />Đang xác minh...</>
                : <>Xác minh <ChevronRight size={16} className="ml-1" /></>
              }
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button onClick={() => setStep("phone")} className="text-stone-500 hover:text-stone-700">
                ← Đổi số điện thoại
              </button>
              {countdown > 0
                ? <span className="text-stone-400">Gửi lại sau {countdown}s</span>
                : <button onClick={handleSendOtp} className="text-primary-600 hover:text-primary-700 font-medium">Gửi lại OTP</button>
              }
            </div>
          </div>
        )}

        {step === "appointments" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-stone-800">{phone}</p>
                  <p className="text-stone-500 text-sm">{appointments.length} lịch hẹn</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => token && fetchAppointments(token)} disabled={isLoading}>
                  <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-500 border-red-200 hover:bg-red-50">
                  <LogOut size={14} />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                <RefreshCw size={32} className="animate-spin mx-auto mb-3 text-primary-400" />
                <p className="text-stone-400">{t("searching")}</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                <Calendar size={48} className="mx-auto mb-4 text-stone-300" />
                <p className="font-semibold text-stone-600 mb-1">Chưa có lịch hẹn nào</p>
                <p className="text-stone-400 text-sm mb-6">Số điện thoại này chưa có lịch hẹn được ghi nhận trong hệ thống</p>
                <Button asChild variant="outline">
                  <a href="/dat-lich">Đặt lịch khám ngay</a>
                </Button>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-stone-700 text-sm px-1">{t("upcomingAppointments")}</h3>
                {appointments.map(apt => {
                  const cfg = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG["pending"];
                  const { Icon } = cfg;
                  return (
                    <div key={apt.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope size={16} className="text-primary-500 mt-0.5 shrink-0" />
                          <span className="font-semibold text-stone-800 text-sm">
                            {apt.departmentName || apt.doctorName || "Khám bệnh"}
                          </span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                          <Icon size={11} />{cfg.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-stone-400 text-xs block mb-0.5">Ngày khám</span>
                          <span className="font-medium text-stone-800">{formatDate(apt.appointmentDate)}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 text-xs block mb-0.5">Giờ khám</span>
                          <span className="font-medium text-stone-800">{apt.appointmentTime || "Theo lịch"}</span>
                        </div>
                        {apt.stt && (
                          <div>
                            <span className="text-stone-400 text-xs block mb-0.5">Số thứ tự</span>
                            <span className="font-bold text-primary-700 text-lg">{apt.stt}</span>
                          </div>
                        )}
                        {apt.doctorName && (
                          <div>
                            <span className="text-stone-400 text-xs block mb-0.5">Bác sĩ</span>
                            <span className="font-medium text-stone-800">{apt.doctorName}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-stone-400 text-xs font-mono">{apt.id}</span>
                        {apt.status === "pending" && (
                          <button
                            onClick={() => toast.info("Tính năng hủy lịch sẽ được hoàn thiện sớm. Vui lòng gọi 0964 392 632 để hủy.")}
                            className="text-xs text-red-500 hover:text-red-600 font-medium"
                          >
                            Yêu cầu hủy
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            <div className="text-center pt-4">
              <a href="/dat-lich" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                <Calendar size={14} />Đặt thêm lịch khám
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
