/**
 * @file types.ts
 * @description SSOT cho tất cả TypeScript Types và Interfaces của dự án.
 * Định nghĩa tại đây, KHÔNG được định nghĩa lại ở bất kỳ file nào khác.
 *
 * @example
 * import type { Doctor, Article, Herb } from "@/lib/types";
 */

// ─────────────────────────────────────────────────────────────
// 1. CHUYÊN KHOA — Department / Specialty
// ─────────────────────────────────────────────────────────────
export interface Department {
  id: string;
  name: string;           // "Y học cổ truyền tổng hợp"
  slug: string;           // "y-hoc-co-truyen-tong-hop"
  description: string;
  icon: string;           // Tên icon Lucide React
  doctorCount: number;
}

// ─────────────────────────────────────────────────────────────
// 2. BÁC SĨ — Doctor
// ─────────────────────────────────────────────────────────────
export type DoctorDegree =
  | "GS.TS"    // Giáo sư Tiến sĩ
  | "PGS.TS"   // Phó Giáo sư Tiến sĩ
  | "TS.BS"    // Tiến sĩ Bác sĩ
  | "ThS.BS"   // Thạc sĩ Bác sĩ
  | "BS.CKI"   // Bác sĩ Chuyên khoa I
  | "BS.CKII"  // Bác sĩ Chuyên khoa II
  | "BS";      // Bác sĩ

export interface Doctor {
  id: string;
  slug: string;
  fullName: string;        // "Nguyễn Văn An"
  degree: DoctorDegree;
  specialty: string;       // "Y học cổ truyền — Châm cứu"
  departmentId: string;
  bio: string;             // Tiểu sử ngắn (max 200 ký tự)
  experience: number;      // Số năm kinh nghiệm
  imageUrl: string;
  schedule: WeeklySchedule;
  consultFee: number;      // Đơn vị: VND
  rating: number;          // 0–5
  reviewCount: number;
  isFeatured: boolean;
}

export interface WeeklySchedule {
  monday?: string[];       // ["08:00", "09:00", "10:00"]
  tuesday?: string[];
  wednesday?: string[];
  thursday?: string[];
  friday?: string[];
  saturday?: string[];
}

// ─────────────────────────────────────────────────────────────
// 3. DƯỢC LIỆU — Herb (Vị thuốc Đông y)
// ─────────────────────────────────────────────────────────────
export type HerbCategory =
  | "Bổ khí"
  | "Bổ huyết"
  | "Bổ âm"
  | "Bổ dương"
  | "Giải biểu"
  | "Thanh nhiệt"
  | "Hoạt huyết"
  | "An thần"
  | "Tiêu hóa"
  | "Khác";

export interface Herb {
  id: string;
  slug: string;
  name: string;            // "Hà Thủ Ô Đỏ"
  latinName: string;       // "Polygonum multiflorum Thunb."
  category: HerbCategory;
  description: string;     // Mô tả ngắn
  benefits: string[];      // ["Bổ gan thận", "Đen râu tóc"]
  usage: string;           // Cách dùng, liều lượng
  caution: string;         // Lưu ý, chống chỉ định
  imageUrl: string;
  isFeatured: boolean;
}

// ─────────────────────────────────────────────────────────────
// 4. TIN TỨC / BÀI VIẾT — Article
// ─────────────────────────────────────────────────────────────
export type ArticleCategory =
  | "Tin tức"
  | "Nghiên cứu khoa học"
  | "Sức khỏe & Đời sống"
  | "Dược liệu"
  | "Hướng dẫn sức khỏe";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;         // Tóm tắt ngắn (max 160 ký tự — chuẩn SEO)
  content: string;         // Nội dung đầy đủ (HTML/Markdown)
  category: ArticleCategory;
  author: string;          // Tên tác giả
  authorTitle: string;     // "GS.TS. Nguyễn Văn An"
  publishedAt: string;     // ISO 8601
  updatedAt?: string;
  imageUrl: string;
  readingTime: number;     // Phút đọc
  tags: string[];
  isFeatured: boolean;
  viewCount: number;
}

// ─────────────────────────────────────────────────────────────
// 5. ĐẶT LỊCH KHÁM — Appointment Booking
// ─────────────────────────────────────────────────────────────
export type AppointmentStatus =
  | "pending"    // Chờ xác nhận
  | "confirmed"  // Đã xác nhận
  | "completed"  // Đã hoàn thành
  | "cancelled"; // Đã hủy

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientDob: string;     // ISO 8601
  patientGender: "male" | "female" | "other";
  departmentId: string;
  doctorId: string;
  appointmentDate: string; // ISO 8601
  appointmentTime: string; // "09:00"
  symptoms: string;        // Mô tả triệu chứng
  status: AppointmentStatus;
  createdAt: string;       // ISO 8601
  notes?: string;          // Ghi chú của bác sĩ
}

/** Dữ liệu người dùng nhập vào form đặt lịch (Bước 1–4) */
export interface BookingFormData {
  // Bước 1: Chọn khoa
  departmentId: string;
  // Bước 2: Chọn bác sĩ
  doctorId: string;
  // Bước 3: Chọn ngày giờ
  appointmentDate: string;
  appointmentTime: string;
  // Bước 4: Thông tin bệnh nhân
  patientName: string;
  patientPhone: string;
  patientDob: string;
  patientGender: "male" | "female" | "other";
  symptoms: string;
}

// ─────────────────────────────────────────────────────────────
// 6. TỔNG QUAN / THỐNG KÊ — Stats
// ─────────────────────────────────────────────────────────────
export interface HospitalStat {
  label: string;    // "Bác sĩ chuyên khoa"
  value: string;    // "50+"
  icon: string;     // Tên icon Lucide
}

// ─────────────────────────────────────────────────────────────
// 7. RESPONSE API (cho Phase 2 — tích hợp backend)
// ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
