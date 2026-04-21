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
 * [DRAFT] Tạo hồ sơ bệnh nhân trong HIS (VD: bảng MEDI.BENHNHAN)
 * CẦN CHỜ SẾP CUNG CẤP CẤU TRÚC SQL / STORED PROCEDURE CHUẨN CỦA BỆNH VIỆN
 */
export async function createHisPatient(data: HISPatientData): Promise<string> {
  // TODO: Thay thế bằng Stored Procedure thực tế của phần mềm Tiếp Nhận
  console.log("[HIS Integration] Đang gọi HIS để tạo bệnh nhân...", data);
  const fakePatientId = `BN_${Date.now()}`;
  return fakePatientId;
}

/**
 * [DRAFT] Tạo phiếu tiếp nhận và viện phí (VD: bảng MEDI.XN_VIENPHI)
 */
export async function createHisAdmission(data: HISAdmissionData): Promise<string> {
  // TODO: Thay thế bằng SQL chuẩn
  console.log("[HIS Integration] Đang tạo phiếu tiếp nhận/viện phí HIS...", data);
  const fakeAdmissionId = `TN_${Date.now()}`;
  return fakeAdmissionId;
}

/**
 * [DRAFT] Đẩy bệnh nhân vào danh sách chờ khám (VD: bảng MEDI.KHAMBENH)
 */
export async function pushToDoctorQueue(admissionId: string, doctorId: string): Promise<boolean> {
  // TODO: Thay thế bằng SQL chuẩn
  console.log(`[HIS Integration] Đã đẩy phiếu ${admissionId} vào phòng bác sĩ ${doctorId}`);
  return true;
}
