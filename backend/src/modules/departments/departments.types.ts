/**
 * @file departments.types.ts
 * @description TypeScript types cho module Chuyên khoa, map từ Oracle MEDI.DMCHUYENKHOA
 */

export interface OracleDepartment {
  ID: number;
  TEN: string | null;
  NGAYUD: Date | null;
}

export interface DepartmentDTO {
  id: number;
  name: string;
  slug: string;
  description: string;
  doctorCount: number;
}
