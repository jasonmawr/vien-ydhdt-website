/**
 * @file doctors.service.ts
 * @description Service truy vấn Oracle MEDI.DMBS
 * Lưu ý: Cột HINH là BLOB ảnh nhị phân — ta trả về URL proxy thay vì base64 trực tiếp.
 * JOIN MEDI.DMPHAI để lấy tên giới tính chuẩn từ DB thay vì map cứng 0/1.
 * JOIN MEDI.NHOMNV để lấy tên nhóm/chức danh nhân viên từ DB.
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

/**
 * Map giới tính: ưu tiên tên từ MEDI.DMPHAI (JOIN thực tế), fallback về mã số.
 * DMPHAI.MAPHAI = mã số giới tính, DMPHAI.TENPHAI = tên hiển thị (Nam/Nữ)
 */
function mapGender(phai: number | null, tenPhai: string | null): "male" | "female" | "unknown" {
  if (tenPhai) {
    const t = tenPhai.trim().toUpperCase();
    if (t === "NAM" || t === "M" || t === "MALE") return "male";
    if (t === "NỮ" || t === "NU" || t === "F" || t === "FEMALE") return "female";
  }
  if (phai === 0) return "male";
  if (phai === 1) return "female";
  return "unknown";
}

/**
 * Lấy tên hiển thị chức danh từ MEDI.NHOMNV (nhóm nhân viên).
 * Fallback về extractDegree từ BANGCAP nếu không có dữ liệu nhóm.
 */
function resolveTitle(bangcap: string | null, tenNhom: string | null): string {
  if (tenNhom && tenNhom.trim()) return tenNhom.trim();
  return extractDegree(bangcap);
}

/** SQL fragment chung để chọn cột bác sĩ + JOIN các bảng danh mục */
const DOCTOR_SELECT = `
  SELECT bs.MA, bs.HOTEN, bs.MAKP, bs.CHUYENKHOA, bs.PHAI,
         bs.BANGCAP, bs.KINHNGHIEM, bs.NGAYSINH, bs.DIENTHOAI,
         bs.HIDE, bs.STT, bs.NHOM,
         ck.TEN  AS TEN_KHOA,
         ph.TEN AS TEN_PHAI,
         nhom.TEN AS TEN_NHOM
  FROM MEDI.DMBS bs
  LEFT JOIN MEDI.DMCHUYENKHOA ck   ON ck.ID      = bs.CHUYENKHOA
  LEFT JOIN MEDI.DMPHAI       ph   ON ph.MA       = bs.PHAI
  LEFT JOIN MEDI.NHOMNHANVIEN nhom ON nhom.ID     = bs.NHOM
`;

type OracleDoctorFull = OracleDoctor & {
  TEN_KHOA: string | null;
  TEN_PHAI: string | null;
  TEN_NHOM: string | null;
  NHOM: string | null;
};

function toDTO(row: OracleDoctorFull, featured?: boolean): DoctorDetailDTO {
  return {
    id: row.MA,
    fullName: row.HOTEN ?? "",
    degree: resolveTitle(row.BANGCAP, row.TEN_NHOM),
    departmentId: row.CHUYENKHOA,
    gender: mapGender(row.PHAI, row.TEN_PHAI),
    experience: row.KINHNGHIEM,
    phone: row.DIENTHOAI,
    imageUrl: `/api/doctors/${row.MA}/image`,
    isFeatured: featured ?? (row.STT !== null && row.STT <= 10),
    specialty: row.TEN_KHOA ?? undefined,
    staffGroup: row.TEN_NHOM ?? undefined,
  };
}

const DOCTOR_BASE_FILTER = `
  WHERE (bs.HIDE IS NULL OR bs.HIDE = 0)
    AND bs.HOTEN IS NOT NULL
    AND NOT REGEXP_LIKE(UPPER(bs.HOTEN), '^(ĐD|DS|CN|YS|DD|KTV|CS|NHS)\\.?')
    AND UPPER(bs.HOTEN) NOT LIKE '%DS.%'
`;

export async function getAllDoctors(limit?: number): Promise<DoctorDTO[]> {
  const conn = await getConnection();
  try {
    const bindParams: Record<string, any> = {};
    let sql = `
      ${DOCTOR_SELECT}
      ${DOCTOR_BASE_FILTER}
      ORDER BY bs.STT NULLS LAST, bs.MA
    `;

    if (limit !== undefined && limit !== null) {
      sql += ` FETCH FIRST :limit ROWS ONLY`;
      bindParams.limit = limit;
    }

    const result = await conn.execute<OracleDoctorFull>(sql, bindParams);
    if (!result.rows) return [];
    return result.rows.map((row) => toDTO(row));
  } finally {
    await conn.close();
  }
}

export async function getFeaturedDoctors(limit = 8): Promise<DoctorDTO[]> {
  const conn = await getConnection();
  try {
    const result = await conn.execute<OracleDoctorFull>(
      `${DOCTOR_SELECT}
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
    return result.rows.map((row) => toDTO(row, true));
  } finally {
    await conn.close();
  }
}

export async function getDoctorById(ma: string): Promise<DoctorDetailDTO | null> {
  const conn = await getConnection();
  try {
    const result = await conn.execute<OracleDoctorFull>(
      `${DOCTOR_SELECT} WHERE bs.MA = :ma`,
      { ma }
    );

    if (!result.rows || result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      ...toDTO(row),
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
    const result = await conn.execute<OracleDoctorFull>(
      `${DOCTOR_SELECT}
       WHERE bs.CHUYENKHOA = :chuyenkhoa
         AND (bs.HIDE IS NULL OR bs.HIDE = 0)
         AND bs.HOTEN IS NOT NULL
         AND NOT REGEXP_LIKE(UPPER(bs.HOTEN), '^(ĐD|DS|CN|YS|DD|KTV|CS|NHS)\\.?')
         AND UPPER(bs.HOTEN) NOT LIKE '%DS.%'
       ORDER BY bs.STT NULLS LAST`,
      { chuyenkhoa }
    );

    if (!result.rows) return [];
    return result.rows.map((row) => toDTO(row));
  } finally {
    await conn.close();
  }
}
