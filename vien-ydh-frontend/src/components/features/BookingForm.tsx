"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, CheckCircle2, Calendar as CalendarIcon, Clock, User, Phone, FileText } from "lucide-react";
import { DEPARTMENTS_DATA, DOCTORS_DATA } from "@/services/mockData";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5;

export default function BookingForm() {
  const [step, setStep] = useState<Step>(1);
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

  // Derived data
  const availableDoctors = useMemo(() => {
    if (!formData.departmentId) return DOCTORS_DATA;
    return DOCTORS_DATA.filter((doc) => doc.departmentId === formData.departmentId);
  }, [formData.departmentId]);

  const selectedDoctor = DOCTORS_DATA.find((d) => d.id === formData.doctorId);
  const selectedDept = DEPARTMENTS_DATA.find((d) => d.id === formData.departmentId);

  // Generate next 7 days for Date selection (skip Sunday)
  const availableDates = useMemo(() => {
    const dates = [];
    let d = new Date();
    d.setDate(d.getDate() + 1); // Start from tomorrow
    while (dates.length < 5) {
      if (d.getDay() !== 0) { // Not Sunday
        dates.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }, []);

  const handleNext = () => setStep((s) => Math.min(s + 1, 5) as Step);
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const updateForm = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return !!formData.departmentId;
      case 2: return !!formData.doctorId;
      case 3: return !!formData.appointmentDate && !!formData.appointmentTime;
      case 4: 
        return formData.patientName.length > 2 && 
               /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(formData.patientPhone) && 
               !!formData.patientDob;
      default: return true;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStepValid()) {
      // API Call mock
      setTimeout(() => {
        setStep(5);
      }, 1000);
    }
  };

  // ---------------------------------------------------------
  // Render Steps
  // ---------------------------------------------------------
  const renderStep1 = () => (
    <div className="space-y-4 animate-fade-in-up">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">1. Chọn Chuyên Khoa</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {DEPARTMENTS_DATA.map((dept) => (
          <div
            key={dept.id}
            onClick={() => { updateForm("departmentId", dept.id); updateForm("doctorId", ""); }}
            className={cn(
              "cursor-pointer rounded-xl border p-4 transition-all",
              formData.departmentId === dept.id
                ? "border-primary-800 bg-[#ecfdf5] ring-1 ring-primary-800"
                : "border-gray-200 bg-white hover:border-primary-800/30 hover:bg-gray-50"
            )}
          >
            <h4 className="font-semibold text-[#1a1a1a]">{dept.name}</h4>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{dept.description}</p>
          </div>
        ))}
      </div>
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
        {availableDoctors.map((doc) => (
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
            <img src={doc.imageUrl} alt={doc.fullName} className="h-16 w-16 rounded-full object-cover bg-gray-100" />
            <div>
              <h4 className="font-semibold text-[#1a1a1a]">{doc.degree} {doc.fullName}</h4>
              <p className="text-sm text-primary-800">{doc.specialty}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in-up">
      <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">3. Chọn Ngày & Giờ</h3>
      
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">Ngày khám</label>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
          {availableDates.map((date) => {
            const dateStr = date.toISOString().split("T")[0];
            const isSelected = formData.appointmentDate === dateStr;
            const dayName = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date);
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
              className="block w-full rounded-xl border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm focus:border-primary-800 focus:bg-white focus:ring-1 focus:ring-primary-800"
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
              className="block w-full rounded-xl border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm focus:border-primary-800 focus:bg-white focus:ring-1 focus:ring-primary-800"
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
            className="block w-full rounded-xl border-gray-200 bg-gray-50 py-2.5 px-3 text-sm focus:border-primary-800 focus:bg-white focus:ring-1 focus:ring-primary-800"
            value={formData.patientDob}
            onChange={(e) => updateForm("patientDob", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Giới tính</label>
          <div className="flex gap-4">
            {["male", "female"].map((g) => (
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
              className="block w-full rounded-xl border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm focus:border-primary-800 focus:bg-white focus:ring-1 focus:ring-primary-800"
              placeholder="Mô tả ngắn gọn vấn đề sức khỏe của bạn..."
              value={formData.symptoms}
              onChange={(e) => updateForm("symptoms", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12 animate-fade-in-up">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-10 w-10 text-primary-800" />
      </div>
      <h3 className="mb-2 font-heading text-2xl font-bold text-[#1a1a1a]">Đặt Lịch Thành Công!</h3>
      <p className="mb-8 text-gray-600 max-w-md mx-auto">
        Cảm ơn bạn đã tin tưởng Viện Y Dược Học Dân Tộc. Thông tin lịch khám đã được gửi vào số điện thoại của bạn. Nhân viên y tế sẽ gọi điện xác nhận trong thời gian sớm nhất.
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
      {step < 5 && (
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  step === i ? "bg-primary-800 text-white ring-4 ring-emerald-100" :
                  step > i ? "bg-emerald-100 text-primary-800" : "bg-gray-200 text-gray-500"
                )}>
                  {step > i ? <CheckCircle2 className="h-5 w-5" /> : i}
                </div>
                {i < 4 && (
                  <div className={cn("h-1 w-8 sm:w-16 transition-colors", step > i ? "bg-emerald-200" : "bg-gray-200")} />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm font-medium text-gray-500 hidden sm:block">
            Bước {step}/4
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 md:p-10">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderSuccess()}

        {/* Footer Actions */}
        {step < 5 && (
          <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                step === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-primary-800"
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
            ) : (
              <button
                type="submit"
                disabled={!isStepValid()}
                className={cn(
                  "btn-accent px-8 shadow-lg",
                  !isStepValid() && "opacity-50 cursor-not-allowed"
                )}
              >
                Xác nhận đặt lịch
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
