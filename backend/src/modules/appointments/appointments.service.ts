/**
 * @file appointments.service.ts
 * @description Ghi lịch hẹn khám vào Oracle.
 * Đây là bảng mới - nếu chưa có sẽ dùng bảng tạm hoặc tạo bảng mới.
 */
import { getConnection } from "../../shared/database";
import type { CreateAppointmentDTO, AppointmentResponse } from "./appointments.types";

/**
 * Tạo lịch hẹn khám trong Oracle DB.
 * Viết vào bảng WEBSITE_APPOINTMENTS (bảng riêng cho website).
 */
export async function createAppointment(
  data: CreateAppointmentDTO
): Promise<AppointmentResponse> {
  const conn = await getConnection();
  try {
    // Tạo bảng nếu chưa có (chỉ chạy lần đầu)
    await ensureTableExists(conn);

    const id = `WEB-${Date.now()}`;
    await conn.execute(
      `INSERT INTO WEBSITE_APPOINTMENTS
         (ID, PATIENT_NAME, PATIENT_PHONE, PATIENT_DOB, PATIENT_GENDER,
          DEPARTMENT_ID, DOCTOR_ID, APPOINTMENT_DATE, APPOINTMENT_TIME,
          SYMPTOMS, STATUS, CREATED_AT)
       VALUES
         (:id, :patientName, :patientPhone, :patientDob, :patientGender,
          :departmentId, :doctorId, :appointmentDate, :appointmentTime,
          :symptoms, 'PENDING', SYSDATE)`,
      {
        id,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        patientDob: data.patientDob ?? null,
        patientGender: data.patientGender ?? null,
        departmentId: data.departmentId ?? null,
        doctorId: data.doctorId ?? null,
        appointmentDate: data.appointmentDate ?? null,
        appointmentTime: data.appointmentTime ?? null,
        symptoms: data.symptoms ?? null,
      }
    );

    return {
      success: true,
      message: "Đặt lịch thành công! Nhân viên sẽ liên hệ xác nhận trong thời gian sớm nhất.",
      data: {
        id,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    console.error("[appointments] createAppointment error:", err);
    throw err;
  } finally {
    await conn.close();
  }
}

export async function getAllAppointments(limit = 50) {
  const conn = await getConnection();
  try {
    await ensureTableExists(conn);
    const result = await conn.execute(
      `SELECT * FROM WEBSITE_APPOINTMENTS ORDER BY CREATED_AT DESC FETCH FIRST :limit ROWS ONLY`,
      { limit }
    );
    return result.rows ?? [];
  } finally {
    await conn.close();
  }
}

/** Tạo bảng WEBSITE_APPOINTMENTS nếu chưa tồn tại */
async function ensureTableExists(conn: any): Promise<void> {
  try {
    await conn.execute(`SELECT COUNT(*) FROM WEBSITE_APPOINTMENTS WHERE ROWNUM = 1`);
  } catch {
    // Bảng chưa có -> tạo mới
    await conn.execute(`
      CREATE TABLE WEBSITE_APPOINTMENTS (
        ID               VARCHAR2(50)    PRIMARY KEY,
        PATIENT_NAME     NVARCHAR2(255)  NOT NULL,
        PATIENT_PHONE    VARCHAR2(20)    NOT NULL,
        PATIENT_DOB      VARCHAR2(20),
        PATIENT_GENDER   VARCHAR2(10),
        DEPARTMENT_ID    VARCHAR2(20),
        DOCTOR_ID        VARCHAR2(20),
        APPOINTMENT_DATE VARCHAR2(30),
        APPOINTMENT_TIME VARCHAR2(10),
        SYMPTOMS         NVARCHAR2(2000),
        STATUS           VARCHAR2(20)    DEFAULT 'PENDING',
        NOTES            NVARCHAR2(1000),
        CREATED_AT       DATE            DEFAULT SYSDATE,
        UPDATED_AT       DATE            DEFAULT SYSDATE
      )
    `);
    console.log("✅ Đã tạo bảng WEBSITE_APPOINTMENTS.");
  }
}
