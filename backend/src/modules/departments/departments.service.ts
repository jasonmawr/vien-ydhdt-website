/**
 * @file departments.service.ts
 * @description Service truy vấn Oracle MEDI.DMCHUYENKHOA
 */
import { getConnection } from "../../shared/database";
import type { OracleDepartment, DepartmentDTO } from "./departments.types";

// Map slug từ tên chuyên khoa
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
    .replace(/[èéẹẻẽêềếệểễ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i")
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
    .replace(/[ùúụủũưừứựửữ]/g, "u")
    .replace(/[ỳýỵỷỹ]/g, "y")
    .replace(/đ/g, "d")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

// Mô tả mặc định cho từng chuyên khoa
const DESCRIPTIONS: Record<number, string> = {
  1: "Chẩn đoán và điều trị các bệnh lý nội khoa bằng phương pháp Y học cổ truyền kết hợp hiện đại.",
  2: "Điều trị các bệnh ngoại khoa, phẫu thuật kết hợp phục hồi chức năng theo Y học dân tộc.",
  3: "Chăm sóc sức khỏe toàn diện cho trẻ em bằng các phương pháp Y học cổ truyền an toàn.",
  4: "Chăm sóc sức khỏe bà mẹ và thai nhi, điều trị sản phụ khoa theo y học dân tộc.",
};

export async function getAllDepartments(): Promise<DepartmentDTO[]> {
  const conn = await getConnection();
  try {
    // Lấy danh sách chuyên khoa kèm số bác sĩ
    const result = await conn.execute<OracleDepartment & { DOCTOR_COUNT: number }>(
      `SELECT ck.ID, ck.TEN, ck.NGAYUD,
              COUNT(bs.MA) as DOCTOR_COUNT
       FROM MEDI.DMCHUYENKHOA ck
       LEFT JOIN MEDI.DMBS bs ON bs.CHUYENKHOA = ck.ID AND (bs.HIDE IS NULL OR bs.HIDE = 0)
       GROUP BY ck.ID, ck.TEN, ck.NGAYUD
       ORDER BY ck.ID`
    );

    if (!result.rows) return [];

    return result.rows.map((row: OracleDepartment & { DOCTOR_COUNT: number }) => ({
      id: row.ID,
      name: row.TEN ?? `Chuyên khoa ${row.ID}`,
      slug: toSlug(row.TEN ?? `chuyen-khoa-${row.ID}`),
      description: DESCRIPTIONS[row.ID] ?? "Khoa điều trị chuyên sâu bằng Y học cổ truyền.",
      doctorCount: row.DOCTOR_COUNT ?? 0,
    }));
  } finally {
    await conn.close();
  }
}

export async function getDepartmentById(id: number): Promise<DepartmentDTO | null> {
  const conn = await getConnection();
  try {
    const result = await conn.execute<OracleDepartment & { DOCTOR_COUNT: number }>(
      `SELECT ck.ID, ck.TEN, ck.NGAYUD,
              COUNT(bs.MA) as DOCTOR_COUNT
       FROM MEDI.DMCHUYENKHOA ck
       LEFT JOIN MEDI.DMBS bs ON bs.CHUYENKHOA = ck.ID AND (bs.HIDE IS NULL OR bs.HIDE = 0)
       WHERE ck.ID = :id
       GROUP BY ck.ID, ck.TEN, ck.NGAYUD`,
      { id }
    );

    if (!result.rows || result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: row.ID,
      name: row.TEN ?? `Chuyên khoa ${row.ID}`,
      slug: toSlug(row.TEN ?? `chuyen-khoa-${row.ID}`),
      description: DESCRIPTIONS[row.ID] ?? "Khoa điều trị chuyên sâu bằng Y học cổ truyền.",
      doctorCount: row.DOCTOR_COUNT ?? 0,
    };
  } finally {
    await conn.close();
  }
}
