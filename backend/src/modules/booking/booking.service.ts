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
      SELECT ID, MA, TEN, DVT, GIA_BH, GIA_DV, GIA_NN, BHYT
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
      priceExpert: r.GIA_NN || 0,
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
 * Lấy slot availability của bác sĩ trong ngày
 */
export async function getDoctorAvailability(
  doctorId: string,
  date: string
): Promise<Record<string, { available: number; total: number; status: string }>> {
  const MAX_PER_SLOT = Number(process.env.MAX_APPOINTMENTS_PER_SLOT) || 10;

  // Generate tất cả slots trong ngày: 06:00-11:00 và 13:00-16:00
  const slots: string[] = [];
  for (let h = 6; h <= 11; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 11) slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  for (let h = 13; h <= 16; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 16) slots.push(`${String(h).padStart(2, '0')}:30`);
  }

  const bookedMap = new Map<string, number>();

  try {
    const conn = await getConnection();
    try {
      // Đếm lịch hẹn theo từng giờ từ Oracle HIS
      // W_HEN không có cột NGAYHEN — ngày/giờ nằm trong W_HENCT.NGAY
      const params: any = { date };
      let sql = `
        SELECT
          TO_CHAR(hct.NGAY, 'HH24:MI') AS TIME_SLOT,
          COUNT(*) AS BOOKED
        FROM MEDI.W_HEN h
        JOIN MEDI.W_HENCT hct ON hct.ID = h.ID
        WHERE TRUNC(hct.NGAY) = TO_DATE(:date, 'YYYY-MM-DD')
          AND (h.DONE IS NULL OR h.DONE = 0)
      `;
      if (doctorId) {
        sql += ` AND h.MABS = :doctorId`;
        params.doctorId = doctorId;
      }
      sql += ` GROUP BY TO_CHAR(hct.NGAY, 'HH24:MI')`;

      const result = await conn.execute<any[]>(sql, params);
      for (const row of result.rows || []) {
        bookedMap.set(row[0] as string, Number(row[1]));
      }
    } catch {
      // HIS không khả dụng — trả về tất cả slots đều trống
    } finally {
      await conn.close();
    }
  } catch {}

  return Object.fromEntries(
    slots.map(slot => {
      const booked = bookedMap.get(slot) || 0;
      const available = Math.max(0, MAX_PER_SLOT - booked);
      return [slot, {
        available,
        total: MAX_PER_SLOT,
        status: available === 0 ? 'full' : available <= 3 ? 'limited' : 'open',
      }];
    })
  );
}

/**
 * Lấy danh sách Bác sĩ từ MEDI.DMBS
 */
export async function getDoctors(): Promise<any[]> {
  const conn = await getConnection();
  try {
    const result = await conn.execute(`
      SELECT b.MA, b.HOTEN, b.NHOM, b.MAKP, b.CHUYENKHOA,
             n.TEN AS TENNHOM, ck.TEN AS TENKP
      FROM MEDI.DMBS b
      LEFT JOIN MEDI.NHOMNHANVIEN n ON n.ID = b.NHOM
      LEFT JOIN MEDI.DMCHUYENKHOA ck ON ck.ID = b.CHUYENKHOA
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
