/**
 * @file booking.service.ts
 * @description Đọc dữ liệu đặt khám từ Oracle HIS (Schema MEDI).
 * Tất cả chỉ READ-ONLY, không ghi vào MEDI.
 */
import { getConnection } from "../../shared/database";

// ─── Types ───────────────────────────────────────────
export interface Specialty {
  id: number;
  name: string;
}

export interface ExamPricing {
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

export interface InsuranceTuyen {
  id: number;
  code: string;
  name: string;
  isTraiTuyen: boolean;
  hidden: boolean;
}

export interface PatientType {
  id: number;
  name: string;
}

// ─── Queries ─────────────────────────────────────────

/**
 * Lấy danh mục chuyên khoa từ MEDI.DMCHUYENKHOA
 */
export async function getSpecialties(): Promise<Specialty[]> {
  const conn = await getConnection();
  try {
    const result = await conn.execute(`SELECT ID, TEN FROM MEDI.DMCHUYENKHOA ORDER BY ID`);
    return (result.rows || []).map((r: any) => ({
      id: r.ID,
      name: r.TEN,
    }));
  } finally {
    await conn.close();
  }
}

/**
 * Lấy giá khám bệnh từ MEDI.V_GIAVP (lọc dịch vụ khám)
 */
export async function getExamPricing(): Promise<ExamPricing[]> {
  const conn = await getConnection();
  try {
    const result = await conn.execute(`
      SELECT ID, MA, TEN, DVT, GIA_BH, GIA_DV, GIA_NN, GIA_TH, BHYT
      FROM MEDI.V_GIAVP
      WHERE UPPER(TEN) LIKE 'KHÁM%' OR UPPER(TEN) LIKE 'KHAM%'
      ORDER BY TEN
    `);
    return (result.rows || []).map((r: any) => ({
      id: r.ID,
      code: r.MA,
      name: r.TEN,
      unit: r.DVT || "Lần",
      priceBHYT: r.GIA_BH || 0,
      priceService: r.GIA_DV || 0,
      priceRequest: r.GIA_NN || 0,
      priceExpert: r.GIA_TH || 0,
      bhytPercent: r.BHYT || 0,
    }));
  } finally {
    await conn.close();
  }
}

/**
 * Lấy danh mục tuyến BHYT từ MEDI.DMTRAITUYEN
 */
export async function getInsuranceTuyen(): Promise<InsuranceTuyen[]> {
  const conn = await getConnection();
  try {
    const result = await conn.execute(`
      SELECT ID, MA, TEN, TRAITUYEN, HIDE
      FROM MEDI.DMTRAITUYEN
      WHERE HIDE = 0
      ORDER BY STT
    `);
    return (result.rows || []).map((r: any) => ({
      id: r.ID,
      code: r.MA,
      name: r.TEN,
      isTraiTuyen: r.TRAITUYEN !== 0,
      hidden: r.HIDE === 1,
    }));
  } finally {
    await conn.close();
  }
}

/**
 * Lấy đối tượng bệnh nhân từ MEDI.DOITUONG
 */
export async function getPatientTypes(): Promise<PatientType[]> {
  const conn = await getConnection();
  try {
    const result = await conn.execute(`
      SELECT MADOITUONG, DOITUONG FROM MEDI.DOITUONG ORDER BY MADOITUONG
    `);
    return (result.rows || []).map((r: any) => ({
      id: r.MADOITUONG,
      name: r.DOITUONG,
    }));
  } catch {
    // Fallback nếu bảng không truy cập được
    return [
      { id: 1, name: "Bảo hiểm Y tế (BHYT)" },
      { id: 2, name: "Dịch vụ (Không BHYT)" },
      { id: 3, name: "Khám theo Yêu cầu" },
      { id: 10, name: "Khám chuyên gia" },
    ];
  } finally {
    await conn.close();
  }
}

/**
 * Lấy danh sách Bác sĩ từ MEDI.DMBS
 */
export async function getDoctors(): Promise<any[]> {
  const conn = await getConnection();
  try {
    const result = await conn.execute(`
      SELECT b.MABS, b.HOTEN, b.NHOM, n.TEN AS TENNHOM, k.TEN AS TENKP
      FROM MEDI.DMBS b
      LEFT JOIN MEDI.DMNHOM n ON b.NHOM = n.ID
      LEFT JOIN MEDI.BTDKP_BV k ON b.MAKP = k.MAKP
      WHERE b.HIDE IS NULL OR b.HIDE = 0
    `);
    return result.rows || [];
  } catch (e) {
    console.error("Lỗi getDoctors:", e);
    return [];
  } finally {
    await conn.close();
  }
}
