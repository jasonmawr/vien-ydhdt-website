/**
 * @file doctors.service.ts
 * @description Service truy vấn Oracle MEDI.DMBS
 * Lưu ý: Cột HINH là BLOB ảnh nhị phân — ta trả về URL proxy thay vì base64 trực tiếp.
 */
import { getConnection } from "../../shared/database";
import type { OracleDoctor, DoctorDTO, DoctorDetailDTO } from "./doctors.types";

const DEGREE_MAP: Record<string, string> = {
  "GS.TS": "GS.TS",
  "PGS.TS": "PGS.TS",
  "TS.BS": "TS.BS",
  "ThS.BS": "ThS.BS",
  "BSCK2": "BSCK II",
  "BSCK1": "BSCK I",
  "BS": "Bác sĩ",
  "CN": "CN",
  "KTV": "KTV",
  "ĐD": "Điều dưỡng",
};

function extractDegree(bangcap: string | null): string {
  if (!bangcap) return "Bác sĩ";
  for (const [key, val] of Object.entries(DEGREE_MAP)) {
    if (bangcap.toUpperCase().includes(key.toUpperCase())) return val;
  }
  return bangcap.split(" ")[0] ?? "Bác sĩ";
}

function mapGender(phai: number | null): "male" | "female" | "unknown" {
  if (phai === 0) return "male";
  if (phai === 1) return "female";
  return "unknown";
}

export async function getAllDoctors(limit?: number): Promise<DoctorDTO[]> {
  const conn = await getConnection();
  try {
    const sql = `
      SELECT bs.MA, bs.HOTEN, bs.MAKP, bs.CHUYENKHOA, bs.PHAI,
             bs.BANGCAP, bs.KINHNGHIEM, bs.NGAYSINH, bs.DIENTHOAI,
             bs.HIDE, bs.STT,
             ck.TEN as TEN_KHOA
      FROM MEDI.DMBS bs
      LEFT JOIN MEDI.DMCHUYENKHOA ck ON ck.ID = bs.CHUYENKHOA
      WHERE (bs.HIDE IS NULL OR bs.HIDE = 0)
        AND bs.HOTEN IS NOT NULL
        AND NOT REGEXP_LIKE(UPPER(bs.HOTEN), '^(ĐD|DS|CN|YS|DD|KTV|CS|NHS)\\.?')
        AND UPPER(bs.HOTEN) NOT LIKE '%DS.%'
      ORDER BY bs.STT NULLS LAST, bs.MA
      ${limit ? `FETCH FIRST ${limit} ROWS ONLY` : ""}
    `;

    const result = await conn.execute<OracleDoctor & { TEN_KHOA: string | null }>(sql);
    if (!result.rows) return [];

    return result.rows.map((row: OracleDoctor & { TEN_KHOA: string | null }) => ({
      id: row.MA,
      fullName: row.HOTEN ?? "",
      degree: extractDegree(row.BANGCAP),
      departmentId: row.CHUYENKHOA,
      gender: mapGender(row.PHAI),
      experience: row.KINHNGHIEM,
      phone: row.DIENTHOAI,
      imageUrl: `/api/doctors/${row.MA}/image`,
      isFeatured: (row.STT !== null && row.STT <= 10) ?? false,
      specialty: row.TEN_KHOA ?? undefined,
    } as DoctorDetailDTO));
  } finally {
    await conn.close();
  }
}

export async function getFeaturedDoctors(limit = 8): Promise<DoctorDTO[]> {
  const conn = await getConnection();
  try {
    const result = await conn.execute<OracleDoctor & { TEN_KHOA: string | null }>(
      `SELECT bs.MA, bs.HOTEN, bs.MAKP, bs.CHUYENKHOA, bs.PHAI,
              bs.BANGCAP, bs.KINHNGHIEM, bs.NGAYSINH, bs.DIENTHOAI,
              bs.HIDE, bs.STT,
              ck.TEN as TEN_KHOA
       FROM MEDI.DMBS bs
       LEFT JOIN MEDI.DMCHUYENKHOA ck ON ck.ID = bs.CHUYENKHOA
       WHERE (bs.HIDE IS NULL OR bs.HIDE = 0)
         AND bs.HOTEN IS NOT NULL
         AND bs.STT IS NOT NULL
         AND NOT REGEXP_LIKE(UPPER(bs.HOTEN), '^(ĐD|DS|CN|YS|DD|KTV|CS|NHS)\\.?')
         AND UPPER(bs.HOTEN) NOT LIKE '%DS.%'
       ORDER BY bs.STT
       FETCH FIRST :limit ROWS ONLY`,
      { limit }
    );

    if (!result.rows) return [];

    return result.rows.map((row: OracleDoctor & { TEN_KHOA: string | null }) => ({
      id: row.MA,
      fullName: row.HOTEN ?? "",
      degree: extractDegree(row.BANGCAP),
      departmentId: row.CHUYENKHOA,
      gender: mapGender(row.PHAI),
      experience: row.KINHNGHIEM,
      phone: row.DIENTHOAI,
      imageUrl: `/api/doctors/${row.MA}/image`,
      isFeatured: true,
      specialty: row.TEN_KHOA ?? undefined,
    } as DoctorDetailDTO));
  } finally {
    await conn.close();
  }
}

export async function getDoctorById(ma: string): Promise<DoctorDetailDTO | null> {
  const conn = await getConnection();
  try {
    const result = await conn.execute<OracleDoctor & { TEN_KHOA: string | null }>(
      `SELECT bs.MA, bs.HOTEN, bs.MAKP, bs.CHUYENKHOA, bs.PHAI,
              bs.BANGCAP, bs.KINHNGHIEM, bs.NGAYSINH, bs.DIENTHOAI,
              bs.HIDE, bs.STT,
              ck.TEN as TEN_KHOA
       FROM MEDI.DMBS bs
       LEFT JOIN MEDI.DMCHUYENKHOA ck ON ck.ID = bs.CHUYENKHOA
       WHERE bs.MA = :ma`,
      { ma }
    );

    if (!result.rows || result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: row.MA,
      fullName: row.HOTEN ?? "",
      degree: extractDegree(row.BANGCAP),
      departmentId: row.CHUYENKHOA,
      gender: mapGender(row.PHAI),
      experience: row.KINHNGHIEM,
      phone: row.DIENTHOAI,
      imageUrl: `/api/doctors/${row.MA}/image`,
      isFeatured: row.STT !== null && row.STT <= 10,
      specialty: row.TEN_KHOA ?? undefined,
      departmentName: row.TEN_KHOA ?? undefined,
    };
  } finally {
    await conn.close();
  }
}

/**
 * Lấy BLOB ảnh bác sĩ từ Oracle.
 * Trả về Buffer để Express stream trực tiếp về client.
 */
export async function getDoctorImage(ma: string): Promise<Buffer | null> {
  const conn = await getConnection();
  try {
    const result = await conn.execute<{ HINH: any }>(
      `SELECT HINH FROM MEDI.DMBS WHERE MA = :ma`,
      { ma }
    );

    if (!result.rows || result.rows.length === 0) return null;
    const hinh = result.rows[0].HINH;
    if (!hinh) return null;

    // Đọc BLOB stream thành Buffer
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      hinh.on("data", (chunk: Buffer) => chunks.push(chunk));
      hinh.on("end", () => resolve(Buffer.concat(chunks)));
      hinh.on("error", reject);
    });
  } finally {
    await conn.close();
  }
}

export async function getDoctorsByDepartment(chuyenkhoa: number): Promise<DoctorDTO[]> {
  const conn = await getConnection();
  try {
    const result = await conn.execute<OracleDoctor & { TEN_KHOA: string | null }>(
      `SELECT bs.MA, bs.HOTEN, bs.MAKP, bs.CHUYENKHOA, bs.PHAI,
              bs.BANGCAP, bs.KINHNGHIEM, bs.NGAYSINH, bs.DIENTHOAI,
              bs.HIDE, bs.STT,
              ck.TEN as TEN_KHOA
       FROM MEDI.DMBS bs
       LEFT JOIN MEDI.DMCHUYENKHOA ck ON ck.ID = bs.CHUYENKHOA
       WHERE bs.CHUYENKHOA = :chuyenkhoa
         AND (bs.HIDE IS NULL OR bs.HIDE = 0)
         AND bs.HOTEN IS NOT NULL
         AND NOT REGEXP_LIKE(UPPER(bs.HOTEN), '^(ĐD|DS|CN|YS|DD|KTV|CS|NHS)\\.?')
         AND UPPER(bs.HOTEN) NOT LIKE '%DS.%'
       ORDER BY bs.STT NULLS LAST`,
      { chuyenkhoa }
    );

    if (!result.rows) return [];

    return result.rows.map((row: OracleDoctor & { TEN_KHOA: string | null }) => ({
      id: row.MA,
      fullName: row.HOTEN ?? "",
      degree: extractDegree(row.BANGCAP),
      departmentId: row.CHUYENKHOA,
      gender: mapGender(row.PHAI),
      experience: row.KINHNGHIEM,
      phone: row.DIENTHOAI,
      imageUrl: `/api/doctors/${row.MA}/image`,
      isFeatured: row.STT !== null && row.STT <= 10,
      specialty: row.TEN_KHOA ?? undefined,
    } as DoctorDetailDTO));
  } finally {
    await conn.close();
  }
}
