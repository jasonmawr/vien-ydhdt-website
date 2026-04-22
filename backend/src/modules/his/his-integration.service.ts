/**
 * @file his-integration.service.ts
 * @description Xử lý tương tác trực tiếp với schema MEDI của hệ thống HIS.
 * WARNING: Mọi thao tác ghi dữ liệu ở đây đều đẩy thẳng bệnh nhân vào luồng khám thực tế.
 */
import { getConnection } from "../../shared/database";

export interface HISPatientData {
  fullName: string;
  phone: string;
  dob?: string;
  gender?: string;
}

export interface HISAdmissionData {
  patientId: string;
  departmentId: string;
  doctorId?: string;
  amount: number;
}

/**
 * [DRAFT] Tạo hồ sơ bệnh nhân trong HIS (Bảng MEDI.BENHNHAN)
 * CẦN CHỜ SẾP CUNG CẤP CẤU TRÚC SQL / STORED PROCEDURE CHUẨN CỦA BỆNH VIỆN
 */
export async function createHisPatient(data: HISPatientData): Promise<string> {
  // TODO: Thay thế bằng Stored Procedure thực tế của phần mềm Tiếp Nhận
  console.log("[HIS Integration] Đang gọi HIS để tạo bệnh nhân...", data);
  const fakePatientId = `BN_${Date.now()}`;
  return fakePatientId;
}

/**
 * [DRAFT] Đăng ký chờ khám (Ghi vào bảng MEDI.TIEPDON)
 * Bảng TIEPDON chứa danh sách chờ khám thực tế tại phòng khám (MAKP).
 * Sau khi ghi vào đây, tên bệnh nhân sẽ tự động hiển thị trên màn hình gọi số của phòng khám.
 */
export async function createHisAdmission(data: HISAdmissionData): Promise<string> {
  // TODO: Thay thế bằng SQL chuẩn
  // 1. SELECT MAX(MAVAOVIEN), MAX(MAQL) FROM MEDI.TIEPDON ... (Sinh mã)
  // 2. INSERT INTO MEDI.TIEPDON(MABN, MAVAOVIEN, MAQL, MAKP, NGAY, MADOITUONG, ...) 
  //    VALUES (data.patientId, ..., data.departmentId, SYSDATE, ...)
  console.log("[HIS Integration] Đang tạo phiếu tiếp nhận/viện phí HIS...", data);
  const fakeAdmissionId = `TN_${Date.now()}`;
  return fakeAdmissionId;
}

/**
 * Lưu thông tin Hẹn Khám (Ghi vào bảng MEDI.LICH_KHAM_ONLINE)
 * Bảng này được phần mềm Viện quét định kỳ để sinh phiếu Tiếp Đón.
 */
export async function createAppointmentRecord(data: HISAdmissionData & HISPatientData): Promise<boolean> {
  const conn = await getConnection();
  try {
    const maHoSo = `WEB${Date.now().toString().slice(-6)}`;
    
    // Auto-generate next ID sequence or use Max(ID) + 1 if sequence doesn't exist
    // LICH_KHAM_ONLINE ID is NUMBER
    const idRes = await conn.execute(`SELECT NVL(MAX(ID), 0) + 1 as NEXT_ID FROM MEDI.LICH_KHAM_ONLINE`);
    const nextId = (idRes.rows as any[])[0]?.NEXT_ID || 1;

    await conn.execute(`
      INSERT INTO MEDI.LICH_KHAM_ONLINE (
        ID, MAHOSO, HOTEN, SDT, MABS, MAKP, NGAYKHAM, TRANGTHAI, NGAYTAO
      ) VALUES (
        :id, :maHoSo, :hoten, :sdt, :mabs, :makp, SYSDATE, 0, SYSDATE
      )
    `, {
      id: nextId,
      maHoSo,
      hoten: data.fullName,
      sdt: data.phone,
      mabs: data.doctorId || '',
      makp: data.departmentId || '01' // Default MAKP
    });
    
    console.log(`[HIS Integration] Đã ghi nhận lịch hẹn vào LICH_KHAM_ONLINE (Mã HS: ${maHoSo}) cho bệnh nhân ${data.fullName}`);
    return true;
  } catch (err) {
    console.error("[HIS Integration] Lỗi ghi lịch khám online:", err);
    return false; // Phục hồi êm đẹp nếu HIS lỗi
  } finally {
    await conn.close();
  }
}

/**
 * [DRAFT] Thanh toán viện phí Online (Ghi vào bảng MEDI.XN_VIENPHI hoặc tương đương)
 */
export async function confirmHisPayment(admissionId: string, amount: number): Promise<boolean> {
  // TODO: Thay thế bằng SQL chuẩn
  console.log(`[HIS Integration] Đã xác nhận thanh toán ${amount} cho phiếu ${admissionId}`);
  return true;
}
