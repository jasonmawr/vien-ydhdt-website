"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronRight, ChevronLeft, CheckCircle2,
  Calendar as CalendarIcon, Clock, User, Phone, FileText, Loader2
} from "lucide-react";
import {
  getDepartments, getAllDoctors, createAppointment, getDoctorImageUrl, generatePaymentQR,
  type DepartmentDTO, type DoctorDTO
} from "@/services/api";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function BookingForm() {
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [orderId, setOrderId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");

  // Data from API
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [allDoctors, setAllDoctors] = useState<DoctorDTO[]>([]);

  const [formData, setFormData] = useState({
    departmentId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    patientName: "",
    patientPhone: "",
    patientDob: "",
    patientGender: "male",
    symptoms: "",
  });

  // Fetch departments & doctors on mount
  useEffect(() => {
    setIsLoading(true);
    Promise.all([getDepartments(), getAllDoctors()])
      .then(([depts, docs]) => {
        setDepartments(depts);
        setAllDoctors(docs);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Derived data
  const availableDoctors = useMemo(() => {
    if (!formData.departmentId) return allDoctors.slice(0, 8);
    return allDoctors.filter(
      (doc) => doc.departmentId === Number(formData.departmentId)
    );
  }, [formData.departmentId, allDoctors]);

  const selectedDoctor = allDoctors.find((d) => d.id === formData.doctorId);
  const selectedDept = departments.find((d) => String(d.id) === formData.departmentId);

  // Generate next 5 working days (skip Sunday)
  const availableDates = useMemo(() => {
    const dates = [];
    let d = new Date();
    d.setDate(d.getDate() + 1);
    while (dates.length < 5) {
      if (d.getDay() !== 0) dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }, []);

  const handleNext = () => setStep((s) => Math.min(s + 1, 5) as Step);
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const updateForm = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return !!formData.departmentId;
      case 2: return !!formData.doctorId;
      case 3: return !!formData.appointmentDate && !!formData.appointmentTime;
      case 4:
        return (
          formData.patientName.length > 2 &&
          /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(formData.patientPhone) &&
          !!formData.patientDob
        );
      default: return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid()) return;

    setIsSubmitting(true);
    try {
      if (step === 4) {
        // Gọi API sinh mã QR thanh toán
        const qrRes = await generatePaymentQR({ amount: 150000, orderInfo: `Kham benh ${formData.patientPhone}` });
        if (qrRes.success) {
          setQrUrl(qrRes.data.qrCodeUrl);
          setOrderId(qrRes.data.orderId);
          setStep(5);
        } else {
          alert("Không thể tạo mã thanh toán.");
        }
      } else if (step === 5) {
        // Giả lập KH đã quét và IPN báo thành công -> Ghi vào DB
        const result = await createAppointment({
          patientName: formData.patientName,
          patientPhone: formData.patientPhone,
          patientDob: formData.patientDob,
          patientGender: formData.patientGender,
          departmentId: formData.departmentId,
          doctorId: formData.doctorId !== "any" ? formData.doctorId : undefined,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          symptoms: formData.symptoms,
        });

        if (result.success) {
          setSuccessMessage(result.message);
          setAppointmentId(result.data?.id || orderId);
          setStep(6);
        }
      }
    } catch (err) {
      console.error("Đặt lịch thất bại:", err);
      alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────
  // Render Steps
  // ─────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-4 animate-fade-in-up">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">1. Chọn Chuyên Khoa</h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary-700" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {departments.map((dept) => (
            <div
              key={dept.id}
              onClick={() => { updateForm("departmentId", String(dept.id)); updateForm("doctorId", ""); }}
              className={cn(
                "cursor-pointer rounded-xl border p-4 transition-all",
                formData.departmentId === String(dept.id)
                  ? "border-primary-800 bg-[#ecfdf5] ring-1 ring-primary-800"
                  : "border-gray-200 bg-white hover:border-primary-800/30 hover:bg-gray-50"
              )}
            >
              <h4 className="font-semibold text-[#1a1a1a]">{dept.name}</h4>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{dept.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 animate-fade-in-up">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">2. Chọn Bác Sĩ</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div
          onClick={() => updateForm("doctorId", "any")}
          className={cn(
            "cursor-pointer rounded-xl border p-4 transition-all flex items-center justify-center text-center",
            formData.doctorId === "any"
              ? "border-primary-800 bg-[#ecfdf5] ring-1 ring-primary-800"
              : "border-gray-200 bg-white hover:border-primary-800/30 hover:bg-gray-50"
          )}
        >
          <span className="font-semibold">Bác sĩ khám nhanh nhất</span>
        </div>
        {availableDoctors.slice(0, 7).map((doc) => (
          <div
            key={doc.id}
            onClick={() => updateForm("doctorId", doc.id)}
            className={cn(
              "cursor-pointer rounded-xl border p-4 transition-all flex gap-4",
              formData.doctorId === doc.id
                ? "border-primary-800 bg-[#ecfdf5] ring-1 ring-primary-800"
                : "border-gray-200 bg-white hover:border-primary-800/30 hover:bg-gray-50"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getDoctorImageUrl(doc.id)}
              alt={doc.fullName}
              className="h-16 w-16 rounded-full object-cover bg-gray-100 flex-shrink-0"
            />
            <div>
              <h4 className="font-semibold text-[#1a1a1a]">{doc.degree} {doc.fullName}</h4>
              <p className="text-sm text-primary-800">{doc.specialty ?? "Y học cổ truyền"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in-up">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">3. Chọn Ngày &amp; Giờ</h3>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">Ngày khám</label>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
          {availableDates.map((date) => {
            const dateStr = date.toISOString().split("T")[0];
            const isSelected = formData.appointmentDate === dateStr;
            const dayName = new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date);
            const dayNum = date.getDate();
            const monthNum = date.getMonth() + 1;

            return (
              <div
                key={dateStr}
                onClick={() => updateForm("appointmentDate", dateStr)}
                className={cn(
                  "cursor-pointer rounded-xl border py-3 text-center transition-all",
                  isSelected
                    ? "border-primary-800 bg-primary-800 text-white shadow-md"
                    : "border-gray-200 bg-white text-gray-700 hover:border-primary-800/50"
                )}
              >
                <div className={cn("text-xs uppercase mb-1 opacity-80", isSelected ? "text-emerald-100" : "")}>
                  {dayName}
                </div>
                <div className="text-lg font-bold">{dayNum}/{monthNum}</div>
              </div>
            );
          })}
        </div>
      </div>

      {formData.appointmentDate && (
        <div className="animate-fade-in-up">
          <label className="mb-2 block text-sm font-semibold text-gray-700">Khung giờ trống</label>
          <div className="grid gap-3 grid-cols-3 sm:grid-cols-4">
            {["08:00", "08:30", "09:00", "09:30", "10:00", "13:30", "14:00", "15:00", "15:30"].map((time) => (
              <div
                key={time}
                onClick={() => updateForm("appointmentTime", time)}
                className={cn(
                  "cursor-pointer rounded-lg border py-2 text-center text-sm font-medium transition-all",
                  formData.appointmentTime === time
                    ? "border-[#d97706] bg-[#fef3c7] text-[#d97706]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[#d97706]/50"
                )}
              >
                {time}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4 animate-fade-in-up">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">4. Thông Tin Bệnh Nhân</h3>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="patientName" className="mb-1.5 block text-sm font-medium text-gray-700">Họ và tên *</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="patientName"
              type="text"
              required
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm focus:border-primary-800 focus:bg-white focus:ring-1 focus:ring-primary-800 outline-none"
              placeholder="VD: Nguyễn Văn A"
              value={formData.patientName}
              onChange={(e) => updateForm("patientName", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="patientPhone" className="mb-1.5 block text-sm font-medium text-gray-700">Số điện thoại *</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="patientPhone"
              type="tel"
              required
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm focus:border-primary-800 focus:bg-white focus:ring-1 focus:ring-primary-800 outline-none"
              placeholder="VD: 0912345678"
              value={formData.patientPhone}
              onChange={(e) => updateForm("patientPhone", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="patientDob" className="mb-1.5 block text-sm font-medium text-gray-700">Ngày sinh *</label>
          <input
            id="patientDob"
            type="date"
            required
            className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm focus:border-primary-800 focus:bg-white focus:ring-1 focus:ring-primary-800 outline-none"
            value={formData.patientDob}
            onChange={(e) => updateForm("patientDob", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Giới tính</label>
          <div className="flex gap-4">
            {(["male", "female"] as const).map((g) => (
              <label key={g} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={formData.patientGender === g}
                  onChange={(e) => updateForm("patientGender", e.target.value)}
                  className="text-primary-800 focus:ring-primary-800"
                />
                <span className="text-sm">{g === "male" ? "Nam" : "Nữ"}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="symptoms" className="mb-1.5 block text-sm font-medium text-gray-700">Triệu chứng (Không bắt buộc)</label>
          <div className="relative">
            <div className="pointer-events-none absolute top-3 left-3">
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <textarea
              id="symptoms"
              rows={3}
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm focus:border-primary-800 focus:bg-white focus:ring-1 focus:ring-primary-800 outline-none"
              placeholder="Mô tả ngắn gọn vấn đề sức khỏe của bạn..."
              value={formData.symptoms}
              onChange={(e) => updateForm("symptoms", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 animate-fade-in-up flex flex-col items-center text-center">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">5. Thanh Toán Lệ Phí Khám</h3>
      <p className="text-sm text-gray-500 mb-6">Sử dụng App Ngân hàng hoặc Ví điện tử quét mã VietQR bên dưới</p>
      
      <div className="bg-white p-4 border-2 border-dashed border-primary-300 rounded-2xl shadow-sm inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt="VietinBank QR Code" className="w-64 h-64 object-contain" />
      </div>

      <div className="mt-4 bg-blue-50 text-blue-800 p-4 rounded-xl text-sm max-w-sm">
        <p className="font-semibold">Số tiền: 150,000 VNĐ</p>
        <p>Mã đơn: <span className="font-mono">{orderId}</span></p>
      </div>
      
      <p className="text-xs text-gray-400 mt-4 italic max-w-md">
        (Hệ thống sẽ tự động chuyển sang trang Vé Khám Điện Tử khi thanh toán thành công qua VietinBank IPN. Trong lúc Dev, hãy bấm nút Xác nhận bên dưới để giả lập IPN).
      </p>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12 animate-fade-in-up">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-10 w-10 text-primary-800" />
      </div>
      <h3 className="mb-2 font-heading text-2xl font-bold text-[#1a1a1a]">Đặt Lịch Thành Công!</h3>
      <p className="mb-8 text-gray-600 max-w-md mx-auto">
        {successMessage || "Cảm ơn bạn đã tin tưởng Viện Y Dược Học Dân Tộc. Nhân viên y tế sẽ gọi điện xác nhận trong thời gian sớm nhất."}
      </p>
      <div className="inline-block text-left bg-gray-50 rounded-2xl p-6 border border-gray-100 min-w-[300px]">
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
          <CalendarIcon className="h-5 w-5 text-[#d97706]" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Thời gian</p>
            <p className="font-medium">{formData.appointmentTime} - {formData.appointmentDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
          <User className="h-5 w-5 text-primary-800" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Bệnh nhân</p>
            <p className="font-medium">{formData.patientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Chuyên khoa</p>
            <p className="font-medium">{selectedDept?.name || "Chưa xác định"}</p>
          </div>
        </div>
      </div>
      
      {/* Số Thứ Tự Khám (Tự sinh) */}
      <div className="mt-6 mx-auto bg-gradient-to-br from-primary-800 to-emerald-700 text-white p-6 rounded-2xl max-w-[280px] flex flex-col items-center shadow-lg">
        <p className="text-xs font-bold uppercase mb-1 opacity-80 tracking-wider">Số Thứ Tự Khám</p>
        <p className="text-5xl font-black tabular-nums">
          {String(Math.abs(Number(appointmentId?.replace(/\D/g, "").slice(-3)) || 1)).padStart(3, "0")}
        </p>
        <div className="mt-3 pt-3 border-t border-white/20 w-full text-center">
          <p className="text-xs opacity-70">Mã phiếu</p>
          <p className="text-sm font-mono font-semibold">{appointmentId}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-4 max-w-sm mx-auto">
        Vui lòng ghi nhớ <strong>Số Thứ Tự</strong> và đến viện đúng ngày giờ đã hẹn. 
        Đưa <strong>Mã Phiếu</strong> cho nhân viên tiếp nhận để được phục vụ nhanh nhất.
      </p>

      <div className="mt-8">
        <button onClick={() => window.location.reload()} className="btn-outline">
          Đặt lịch mới
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      {/* Progress Bar */}
      {step < 6 && (
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  step === i ? "bg-primary-800 text-white ring-4 ring-emerald-100" :
                  step > i ? "bg-emerald-100 text-primary-800" : "bg-gray-200 text-gray-500 hidden sm:flex"
                )}>
                  {step > i ? <CheckCircle2 className="h-5 w-5" /> : i}
                </div>
                {i < 5 && (
                  <div className={cn("h-1 w-4 sm:w-12 transition-colors", step > i ? "bg-emerald-200" : "bg-gray-200 hidden sm:block")} />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm font-medium text-gray-500">
            Bước {step}/5
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 md:p-10">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderSuccess()}

        {/* Footer Actions */}
        {step < 6 && (
          <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1 || step === 5}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                (step === 1 || step === 5) ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-primary-800"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
                className={cn(
                  "btn-primary px-6",
                  !isStepValid() && "opacity-50 cursor-not-allowed hover:bg-primary-800"
                )}
              >
                Tiếp tục
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : step === 4 ? (
              <button
                type="submit"
                disabled={!isStepValid() || isSubmitting}
                className={cn(
                  "btn-accent px-8 shadow-lg flex items-center gap-2",
                  (!isStepValid() || isSubmitting) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo mã QR...
                  </>
                ) : (
                  "Tiến hành Thanh toán"
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  "btn-accent px-8 shadow-lg flex items-center gap-2",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xác nhận...
                  </>
                ) : (
                  "Đã thanh toán (Giả lập IPN)"
                )}
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
