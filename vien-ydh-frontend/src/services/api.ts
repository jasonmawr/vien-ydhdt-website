/**
 * @file api.ts
 * @description Centralized HTTP Client gọi sang Backend API (Express + Oracle).
 * Đây là SSOT duy nhất cho tất cả data fetching trong Frontend.
 * URL Backend: http://localhost:4000 (dev) | http://api.vienydhdt.gov.vn (prod)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
    data?: { id: string; patientName: string; status: string };
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
