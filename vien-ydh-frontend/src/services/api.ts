/**
 * @file api.ts
 * @description Centralized HTTP Client gọi sang Backend API (Express + Oracle).
 * Đây là SSOT duy nhất cho tất cả data fetching trong Frontend.
 * Tất cả requests đi qua Next.js rewrites proxy (/api/* → localhost:4000/api/*)
 * để đảm bảo hoạt động cả trên PC lẫn mobile devices trong mạng LAN.
 */

// Trên Server (SSR), fetch phải có full URL (localhost:4000).
// Trên Client (Trình duyệt), fetch phải dùng đường dẫn tương đối ("") để Next.js Rewrites tự động trỏ về backend thông qua IP truy cập hiện tại.
const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") : "";

// ─────────────────────────────────────────
// Types (mirror từ backend)
// ─────────────────────────────────────────

export interface DepartmentDTO {
  id: number;
  name: string;
  slug: string;
  description: string;
  doctorCount: number;
}

export interface DoctorDTO {
  id: string;
  fullName: string;
  degree: string;
  departmentId: number | null;
  gender: "male" | "female" | "unknown";
  experience: string | null;
  phone: string | null;
  imageUrl: string;
  isFeatured: boolean;
  specialty?: string;
  departmentName?: string;
}

export interface CreateAppointmentPayload {
  patientName: string;
  patientPhone: string;
  patientDob?: string;
  patientGender?: string;
  departmentId?: string;
  doctorId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  symptoms?: string;
}

export interface AppointmentRecord {
  ID: string;
  PATIENT_NAME: string;
  PATIENT_PHONE: string;
  PATIENT_DOB: string | null;
  PATIENT_GENDER: string | null;
  DEPARTMENT_ID: string | null;
  DOCTOR_ID: string | null;
  APPOINTMENT_DATE: string | null;
  APPOINTMENT_TIME: string | null;
  SYMPTOMS: string | null;
  STATUS: string;
  CREATED_AT: string;
}

// ─────────────────────────────────────────
// Generic Fetch Helper
// ─────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    // Next.js cache: no-store để luôn lấy dữ liệu mới nhất
    cache: options?.method && options.method !== "GET" ? undefined : "no-store",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error ?? `API Error: ${res.status}`);
  }

  return res.json();
}

// ─────────────────────────────────────────
// Departments API
// ─────────────────────────────────────────

export async function getDepartments(): Promise<DepartmentDTO[]> {
  const data = await apiFetch<{ success: boolean; data: DepartmentDTO[] }>("/api/departments");
  return data.data;
}

export async function getDepartmentById(id: number): Promise<DepartmentDTO | null> {
  try {
    const data = await apiFetch<{ success: boolean; data: DepartmentDTO }>(`/api/departments/${id}`);
    return data.data;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────
// Doctors API
// ─────────────────────────────────────────

export async function getFeaturedDoctors(limit = 8): Promise<DoctorDTO[]> {
  const data = await apiFetch<{ success: boolean; data: DoctorDTO[] }>(
    `/api/doctors?featured=true&limit=${limit}`
  );
  return data.data;
}

export async function getAllDoctors(limit?: number): Promise<DoctorDTO[]> {
  const query = limit ? `?limit=${limit}` : "";
  const data = await apiFetch<{ success: boolean; data: DoctorDTO[] }>(`/api/doctors${query}`);
  return data.data;
}

export async function getDoctorById(id: string): Promise<DoctorDTO | null> {
  try {
    const data = await apiFetch<{ success: boolean; data: DoctorDTO }>(`/api/doctors/${id}`);
    return data.data;
  } catch {
    return null;
  }
}

export async function getDoctorsByDepartment(departmentId: number): Promise<DoctorDTO[]> {
  const data = await apiFetch<{ success: boolean; data: DoctorDTO[] }>(
    `/api/doctors?department=${departmentId}`
  );
  return data.data;
}

/**
 * Trả về URL ảnh bác sĩ từ Backend (stream từ Oracle BLOB).
 * Frontend dùng <img src={getDoctorImageUrl(id)} /> trực tiếp.
 */
export function getDoctorImageUrl(doctorId: string): string {
  return `${API_BASE_URL}/api/doctors/${doctorId}/image`;
}

// ─────────────────────────────────────────
// Appointments API
// ─────────────────────────────────────────

export async function createAppointment(payload: CreateAppointmentPayload) {
  return apiFetch<{
    success: boolean;
    message: string;
    data?: { id: string; patientName: string; status: string; stt?: number };
  }>("/api/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAppointments(token: string, limit = 50): Promise<AppointmentRecord[]> {
  const data = await apiFetch<{ success: boolean; data: AppointmentRecord[] }>(
    `/api/appointments?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data.data;
}

// ─────────────────────────────────────────
// Payment API
// ─────────────────────────────────────────

export async function generatePaymentQR(payload: { amount: number; orderInfo: string }) {
  return apiFetch<{
    success: boolean;
    data: { qrCodeUrl: string; orderId: string };
  }>("/api/payment/generate-qr", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─────────────────────────────────────────
// Booking API (Đọc trực tiếp từ Oracle HIS)
// ─────────────────────────────────────────

export interface SpecialtyDTO {
  id: number;
  name: string;
}

export interface ExamPricingDTO {
  id: number;
  code: string;
  name: string;
  unit: string;
  priceBHYT: number;
  priceService: number;
  priceRequest: number;
  priceExpert: number;
  bhytPercent: number;
}

export interface InsuranceTuyenDTO {
  id: number;
  code: string;
  name: string;
  isTraiTuyen: boolean;
}

export interface PatientTypeDTO {
  id: number;
  name: string;
}

export async function getHISSpecialties(): Promise<SpecialtyDTO[]> {
  const data = await apiFetch<{ success: boolean; data: SpecialtyDTO[] }>("/api/booking/specialties");
  return data.data;
}

export async function getHISDoctors(): Promise<any[]> {
  const data = await apiFetch<{ success: boolean; data: any[] }>("/api/booking/doctors");
  return data.data;
}

export async function getExamPricing(): Promise<ExamPricingDTO[]> {
  const data = await apiFetch<{ success: boolean; data: ExamPricingDTO[] }>("/api/booking/pricing");
  return data.data;
}

export async function getInsuranceTuyen(): Promise<InsuranceTuyenDTO[]> {
  const data = await apiFetch<{ success: boolean; data: InsuranceTuyenDTO[] }>("/api/booking/insurance-tuyen");
  return data.data;
}

export async function getPatientTypes(): Promise<PatientTypeDTO[]> {
  const data = await apiFetch<{ success: boolean; data: PatientTypeDTO[] }>("/api/booking/patient-types");
  return data.data;
}

// ─────────────────────────────────────────
// Web CMS API (Lấy từ SQLite Backend)
// ─────────────────────────────────────────

export interface PostDTO {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  thumbnail: string | null;
  author: string;
  status: string;
  tags: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedPosts {
  data: PostDTO[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export async function getPosts(category?: string, search?: string, limit = 10, offset = 0, admin = false): Promise<PaginatedPosts> {
  let url = `/api/cms/posts?limit=${limit}&offset=${offset}`;
  if (admin) url += `&admin=1`;
  if (category && category !== "Tất cả") url += `&category=${encodeURIComponent(category)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  
  const response = await apiFetch<{ success: boolean; data: PostDTO[]; pagination: any }>(url);
  return {
    data: response.data,
    pagination: response.pagination
  };
}

export async function getPostById(id: number): Promise<PostDTO> {
  const response = await apiFetch<{ success: boolean; data: PostDTO }>(`/api/cms/posts/${id}`);
  return response.data;
}

export async function getPostBySlug(slug: string): Promise<PostDTO> {
  const response = await apiFetch<{ success: boolean; data: PostDTO }>(`/api/cms/posts/slug/${slug}`);
  return response.data;
}

export async function createPost(data: Partial<PostDTO>, token: string): Promise<{ id: number; message: string }> {
  const response = await apiFetch<{ success: boolean; data: { id: number; message: string } }>("/api/cms/posts", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return response.data;
}

export async function updatePost(id: number, data: Partial<PostDTO>, token: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/api/cms/posts/${id}`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data)
  });
}

export async function deletePost(id: number, token: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/api/cms/posts/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
}

export async function getCategories(): Promise<string[]> {
  const response = await apiFetch<{ success: boolean; data: string[] }>("/api/cms/categories");
  return response.data;
}

export async function getWebDoctor(mabs: string, token: string): Promise<any> {
  const response = await apiFetch<{ success: boolean; data: any }>(`/api/cms/doctors/${mabs}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return response.data;
}

export async function updateWebDoctor(data: any, token: string): Promise<any> {
  const response = await apiFetch<{ success: boolean; message: string }>("/api/cms/doctors", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify(data)
  });
  return response;
}
