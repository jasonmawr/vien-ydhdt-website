/**
 * @file doctors.types.ts
 * @description TypeScript types cho module Bác sĩ, map từ Oracle MEDI.DMBS
 */

/** Cấu trúc raw từ Oracle (tên cột viết hoa) */
export interface OracleDoctor {
  MA: string;
  HOTEN: string | null;
  MAKP: string | null;
  CHUYENKHOA: number | null;
  PHAI: number | null;
  BANGCAP: string | null;
  KINHNGHIEM: string | null;
  NGAYSINH: Date | null;
  DIACHI: string | null;
  DIENTHOAI: string | null;
  HIDE: number | null;
  STT: number | null;
}

/** Cấu trúc trả về cho Frontend (camelCase, an toàn) */
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
}

export interface DoctorDetailDTO extends DoctorDTO {
  specialty?: string;
  departmentName?: string;
}
