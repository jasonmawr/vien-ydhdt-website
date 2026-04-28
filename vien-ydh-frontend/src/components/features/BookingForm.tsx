"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import * as htmlToImage from "html-to-image";
import {
  ChevronRight, ChevronLeft, CheckCircle2,
  Calendar as CalendarIcon, Clock, User, Phone, FileText, Loader2, ShieldCheck, Download
} from "lucide-react";
import {
  getDepartments, getAllDoctors, createAppointment, getDoctorImageUrl, generatePaymentQR,
  getInsuranceTuyen, getExamPricing,
  type DepartmentDTO, type DoctorDTO, type InsuranceTuyenDTO, type ExamPricingDTO
} from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface BookingFormProps {
  initialStep?: Step;
}

export default function BookingForm({ initialStep = 1 }: BookingFormProps) {
  const [step, setStep] = useState<Step>(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [orderId, setOrderId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [stt, setStt] = useState(0);

  // Data from API
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [allDoctors, setAllDoctors] = useState<DoctorDTO[]>([]);
  const [insuranceTuyenList, setInsuranceTuyenList] = useState<InsuranceTuyenDTO[]>([]);
  const [pricingList, setPricingList] = useState<ExamPricingDTO[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [searchDoctor, setSearchDoctor] = useState("");
  
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownloadTicket = async () => {
    if (!ticketRef.current) return;
    try {
      const blob = await htmlToImage.toBlob(ticketRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      if (!blob) throw new Error("Could not generate image blob");
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `Phieu-Kham-${appointmentId || '000'}.png`;
      link.href = blobUrl;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success("Đã tải Phiếu Khám về máy!");
    } catch (err) {
      console.error("Lỗi tải ảnh:", err);
      toast.error("Không thể tải ảnh. Vui lòng chụp màn hình!");
    }
  };

  const [formData, setFormData] = useState({
    departmentId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    patientName: "",
    patientPhone: "",
    patientDob: "",
    patientGender: "male",
    patientIdNumber: "",
    symptoms: "",
    // Đối tượng & BHYT
    patientType: "dich-vu", // bhyt | dich-vu | yeu-cau | chuyen-gia
    bhytNumber: "",
    bhytTuyen: "",
  });

  // Fetch data on mount
  useEffect(() => {
    setIsLoading(true);
    Promise.all([getDepartments(), getAllDoctors(), getInsuranceTuyen(), getExamPricing()])
      .then(([depts, docs, tuyen, prices]) => {
        setDepartments(depts);
        setAllDoctors(docs);
        setInsuranceTuyenList(tuyen);
        setPricingList(prices);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Tính toán giá tiền động cho toàn bộ component
  const defaultPricing = pricingList.find(p => p.code === 'K1') || pricingList[0]; // K1 là Y học cổ truyền, có đủ khung giá
  let summaryPrice = 0;
  if (defaultPricing) {
    if (formData.patientType === "bhyt") summaryPrice = defaultPricing.priceBHYT;
    else if (formData.patientType === "dich-vu") summaryPrice = defaultPricing.priceService;
    else if (formData.patientType === "yeu-cau") summaryPrice = defaultPricing.priceRequest;
    else if (formData.patientType === "chuyen-gia") summaryPrice = defaultPricing.priceExpert;
  }

  // Derived data
  const availableDoctors = useMemo(() => {
    let filtered = allDoctors;
    
    // Filter by department if selected
    if (formData.departmentId) {
      filtered = filtered.filter(
        (doc) => String(doc.departmentId) === formData.departmentId || !doc.departmentId || doc.departmentId === 0
      );
      if (filtered.length === 0) filtered = allDoctors; // Fallback
    }

    // Filter by search query
    if (searchDoctor.trim()) {
      const q = searchDoctor.toLowerCase();
      filtered = filtered.filter(doc => doc.fullName.toLowerCase().includes(q));
    }

    return filtered;
  }, [formData.departmentId, allDoctors, searchDoctor]);

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
    setFormData((prev) => {
      const nextData = { ...prev, [key]: value };
      
      // Auto switch logic: If user selects "Khám trái tuyến" (khac), switch to Dịch vụ
      if (key === "bhytTuyen" && value === "khac") {
        setIsAlertOpen(true); // Mở custom modal thay vì alert
        nextData.patientType = "dich-vu";
        nextData.bhytTuyen = ""; // reset
      }
      
      return nextData;
    });
  };

  const validateStep4 = () => {
    if (formData.patientName.length < 2) return "Vui lòng nhập họ tên đầy đủ.";
    if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(formData.patientPhone)) return "Số điện thoại không hợp lệ (cần 10 số hợp lệ).";
    if (!formData.patientDob) return "Vui lòng chọn ngày sinh.";
    if (formData.patientType === "bhyt" && formData.bhytNumber.length < 10) return "Vui lòng nhập số thẻ BHYT hợp lệ.";
    return null; // OK
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return !!formData.departmentId;
      case 2: return !!formData.doctorId;
      case 3: return !!formData.appointmentDate && !!formData.appointmentTime;
      case 4: return true; // Luôn true để button không bị disabled, ta validate khi click
      default: return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4 && !isStepValid()) return;

    if (step === 4) {
      const errorMsg = validateStep4();
      if (errorMsg) {
        toast.error(errorMsg);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (step === 4) {
        // Gọi API sinh mã QR thanh toán bằng giá tiền đã tính (summaryPrice)
        const qrRes = await generatePaymentQR({ amount: summaryPrice || 150000, orderInfo: `Kham benh ${formData.patientPhone}` });
        if (qrRes.success) {
          setQrUrl(qrRes.data.qrCodeUrl);
          setOrderId(qrRes.data.orderId);
          setStep(5);
        } else {
          toast.error("Không thể tạo mã thanh toán.");
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
          setStt(result.data?.stt || 0);
          setStep(6);
        }
      }
    } catch (err) {
      console.error("Đặt lịch thất bại:", err);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-xl font-bold text-[#1a1a1a]">2. Chọn Bác Sĩ</h3>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Tìm theo tên bác sĩ..."
            value={searchDoctor}
            onChange={(e) => setSearchDoctor(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-800 focus:border-transparent text-sm transition-all"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
        {/* Scrollable container for doctors */}
        <div className="grid gap-4 sm:grid-cols-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar col-span-1 sm:col-span-2 pb-4">
          <div
            onClick={() => updateForm("doctorId", "any")}
            className={cn(
              "cursor-pointer rounded-xl border p-4 transition-all flex flex-col items-center justify-center text-center h-full min-h-[96px]",
              formData.doctorId === "any"
                ? "border-primary-800 bg-[#ecfdf5] ring-1 ring-primary-800"
                : "border-gray-200 bg-white hover:border-primary-800/30 hover:bg-gray-50"
            )}
          >
            <span className="font-semibold text-[#1a1a1a]">Không chọn bác sĩ cụ thể</span>
            <span className="text-xs text-gray-500 block mt-1">(Tự động phân bổ theo lịch trống)</span>
          </div>
          
          {availableDoctors.map((doc) => (
            <div
              key={doc.id}
              onClick={() => updateForm("doctorId", doc.id)}
              className={cn(
                "cursor-pointer rounded-xl border p-4 transition-all flex gap-4 items-center",
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
            {["06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"].map((time) => (
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

        <div>
          <label htmlFor="patientIdNumber" className="mb-1.5 block text-sm font-medium text-gray-700">Số CMND/CCCD</label>
          <input
            id="patientIdNumber"
            type="text"
            className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm focus:border-primary-800 focus:bg-white focus:ring-1 focus:ring-primary-800 outline-none"
            placeholder="VD: 079123456789"
            value={formData.patientIdNumber}
            onChange={(e) => updateForm("patientIdNumber", e.target.value)}
          />
        </div>

        {/* Đối tượng khám */}
        <div className="sm:col-span-2 pt-4 border-t border-gray-100">
          <label className="mb-3 block text-sm font-semibold text-gray-800">Đối tượng khám bệnh *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: "bhyt", label: "BHYT", desc: "Bảo hiểm Y tế", color: "emerald" },
              { value: "dich-vu", label: "Dịch vụ", desc: "Không BHYT", color: "blue" },
              { value: "yeu-cau", label: "Yêu cầu", desc: "Khám theo yêu cầu", color: "amber" },
              { value: "chuyen-gia", label: "Chuyên gia", desc: "BS Chuyên gia", color: "purple" },
            ].map((pt) => (
              <label
                key={pt.value}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all text-center",
                  formData.patientType === pt.value
                    ? `border-${pt.color}-500 bg-${pt.color}-50 ring-2 ring-${pt.color}-200`
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <input
                  type="radio"
                  name="patientType"
                  value={pt.value}
                  checked={formData.patientType === pt.value}
                  onChange={(e) => updateForm("patientType", e.target.value)}
                  className="sr-only"
                />
                <span className="text-sm font-bold">{pt.label}</span>
                <span className="text-xs text-gray-500 mt-1">{pt.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Form BHYT (chỉ hiện khi chọn BHYT) */}
        {formData.patientType === "bhyt" && (
          <div className="sm:col-span-2 p-5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-5">
            <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Thông tin Bảo hiểm Y tế
            </p>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Số thẻ BHYT *</label>
              <input
                type="text"
                maxLength={15}
                className="block w-full sm:w-1/2 rounded-lg border border-emerald-200 bg-white py-2.5 px-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                placeholder="VD: GD49632584585"
                value={formData.bhytNumber}
                onChange={(e) => updateForm("bhytNumber", e.target.value.toUpperCase())}
              />
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-emerald-100">
              <label className="mb-3 block text-sm font-semibold text-gray-800">Chọn đối tượng Bảo hiểm Y tế *</label>
              <div className="space-y-3">
                {[
                  { id: "1.1", label: "Có thẻ BHYT đăng ký khám chữa bệnh ban đầu tại Viện YDHDT" },
                  { id: "1.5", label: "Có tái khám theo hẹn trên đơn thuốc BHYT của Viện YDHDT" },
                  { id: "1.3", label: "Có giấy chuyển BHYT đúng tuyến đến Viện YDHDT" },
                  { id: "khac", label: "Không phải 3 trường hợp trên (Khám trái tuyến)" },
                ].map((option) => (
                  <label key={option.id} className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex h-5 items-center">
                      <input
                        type="radio"
                        name="bhytTuyen"
                        value={option.id}
                        checked={formData.bhytTuyen === option.id}
                        onChange={(e) => updateForm("bhytTuyen", e.target.value)}
                        className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-600"
                      />
                    </div>
                    <div className="text-sm text-gray-700 group-hover:text-emerald-800">{option.label}</div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

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

      <div className="mt-4 bg-blue-50 text-blue-800 p-4 rounded-xl text-sm max-w-sm mx-auto">
        <p className="font-semibold">
          Số tiền: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(summaryPrice)}
        </p>
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
      <div 
        ref={ticketRef}
        className="mt-6 mx-auto text-white p-6 rounded-2xl max-w-[280px] flex flex-col items-center shadow-lg"
        style={{ backgroundColor: '#065f46', backgroundImage: 'linear-gradient(to bottom right, #115e59, #047857)' }}
      >
        <p className="text-xs font-bold uppercase mb-1 opacity-80 tracking-wider">Số Thứ Tự Khám</p>
        <p className="text-5xl font-black tabular-nums">
          {String(Math.abs(Number(stt) || Number(appointmentId?.replace(/\D/g, "").slice(-3)) || 1)).padStart(3, "0")}
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

      <div className="mt-8 flex flex-col gap-3 max-w-[280px] mx-auto">
        <button onClick={handleDownloadTicket} className="btn-primary w-full flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Tải Phiếu Về Máy (Miễn phí)
        </button>
        <button onClick={() => window.location.reload()} className="btn-outline w-full text-sm py-2">
          Đặt lịch mới
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative">
      
      {/* Custom Modal for Trái Tuyến */}
      {isAlertOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Chuyển Đối Tượng</h4>
            <p className="text-sm text-gray-600 mb-6">
              Bạn chọn Khám Trái Tuyến. Theo quy định, chi phí khám sẽ được tính theo giá <strong className="text-blue-700">Dịch vụ (Không BHYT)</strong>.
            </p>
            <button 
              type="button"
              onClick={() => setIsAlertOpen(false)}
              className="w-full btn-primary py-2.5 rounded-xl"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}

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

      <div className="flex flex-col lg:flex-row">
        <form onSubmit={handleSubmit} className="p-6 md:p-10 flex-1">
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

        {/* Summary Panel */}
        {step < 6 && (
          <div className="lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-100 p-6 md:p-10">
            <h4 className="font-bold text-[#1a1a1a] mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-800" />
              Hồ sơ đăng ký
            </h4>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-500">Chuyên khoa</span>
                <span className="font-medium text-right max-w-[150px]">{selectedDept?.name || "---"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-500">Bác sĩ</span>
                <span className="font-medium text-right max-w-[150px]">
                  {formData.doctorId === "any" ? "Phân bổ tự động" : (selectedDoctor ? selectedDoctor.fullName : "---")}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-500">Thời gian</span>
                <span className="font-medium text-right">
                  {formData.appointmentTime || "---"} <br/>
                  {formData.appointmentDate || "---"}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-500">Đối tượng</span>
                <span className="font-medium text-right">
                  {formData.patientType === "bhyt" ? "Bảo hiểm Y tế" : 
                   formData.patientType === "dich-vu" ? "Dịch vụ (Không BHYT)" :
                   formData.patientType === "yeu-cau" ? "Khám theo Yêu cầu" :
                   formData.patientType === "chuyen-gia" ? "Khám Chuyên gia" : "---"}
                </span>
              </div>
              {formData.patientType === "bhyt" && formData.bhytNumber && (
                <div className="flex justify-between border-b border-gray-200 pb-3 text-emerald-700">
                  <span className="opacity-80">Số thẻ BHYT</span>
                  <span className="font-mono font-bold">{formData.bhytNumber}</span>
                </div>
              )}
            </div>
            
            {step >= 4 && summaryPrice > 0 && (
              <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 mb-1 font-semibold uppercase">Tổng tiền khám (Tạm tính)</p>
                <p className="text-xl font-bold text-blue-800">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(summaryPrice)}
                </p>
                <p className="text-xs text-blue-600/70 mt-2">Đã bao gồm phí tiện ích. BHYT (nếu có) sẽ được khấu trừ tại viện.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
