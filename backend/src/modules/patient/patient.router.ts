/**
 * @file patient.router.ts
 * @description Patient Portal API — lịch hẹn, thông tin cá nhân.
 * Base path: /api/patient
 */
import { Router, type Request, type Response } from 'express';
import { requirePatient } from '../patient-auth/patient.middleware';
import { getWebDb } from '../../shared/sqlite';
import { getConnection } from '../../shared/database';
import { logger } from '../../shared/logger';

const router = Router();

// GET /api/patient/me — Thông tin bệnh nhân
router.get('/me', requirePatient, async (req: Request, res: Response) => {
  try {
    const db = await getWebDb();
    const patient = await db.get(`SELECT id, phone, full_name, dob, gender, email, created_at, last_login FROM patients WHERE id = ?`, req.patient!.id);
    if (!patient) {
      res.status(404).json({ success: false, error: 'Không tìm thấy thông tin' });
      return;
    }
    res.json({ success: true, data: patient });
  } catch (err) {
    logger.error(`[Patient] GET /me: ${err}`);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

// PUT /api/patient/me — Cập nhật thông tin
router.put('/me', requirePatient, async (req: Request, res: Response) => {
  try {
    const { fullName, dob, gender, email } = req.body;
    const db = await getWebDb();
    await db.run(
      `UPDATE patients SET full_name = ?, dob = ?, gender = ?, email = ? WHERE id = ?`,
      fullName, dob, gender, email, req.patient!.id
    );
    const patient = await db.get(`SELECT id, phone, full_name, dob, gender, email FROM patients WHERE id = ?`, req.patient!.id);
    res.json({ success: true, data: patient });
  } catch (err) {
    logger.error(`[Patient] PUT /me: ${err}`);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

// GET /api/patient/appointments — Lịch hẹn của bệnh nhân (từ Oracle HIS)
// Cấu trúc đúng: W_LOGIN.DTDIDONG (SĐT) → W_HEN.IDLOGIN → W_HENCT (ngày), DMBS (bác sĩ), DMCHUYENKHOA (khoa)
router.get('/appointments', requirePatient, async (req: Request, res: Response) => {
  try {
    const phone = req.patient!.phone;
    const conn = await getConnection();
    try {
      const result = await conn.execute<any>(
        `SELECT
           h.ID,
           h.MABS,
           h.DONE,
           h.LYDO        AS SYMPTOMS,
           hct.NGAY      AS APPOINTMENT_DATE,
           hct.GHICHU    AS TIME_NOTE,
           bs.HOTEN      AS DOCTOR_NAME,
           ck.TEN        AS DEPT_NAME
         FROM MEDI.W_HEN h
         JOIN  MEDI.W_LOGIN      l   ON l.ID       = h.IDLOGIN
         LEFT JOIN MEDI.W_HENCT  hct ON hct.ID     = h.ID
         LEFT JOIN MEDI.DMBS     bs  ON bs.MA       = h.MABS
         LEFT JOIN MEDI.DMCHUYENKHOA ck ON ck.ID   = bs.CHUYENKHOA
         WHERE l.DTDIDONG = :phone
         ORDER BY hct.NGAY DESC NULLS LAST, h.ID DESC
         FETCH FIRST 50 ROWS ONLY`,
        { phone }
      );

      const appointments = (result.rows || []).map((row: any) => ({
        id: row.ID ?? row[0],
        doctorId: row.MABS ?? row[1],
        status: (() => {
          const done = row.DONE ?? row[2];
          if (done === 1) return 'completed';
          if (done === 2) return 'cancelled';
          return 'pending';
        })(),
        symptoms: row.SYMPTOMS ?? row[3],
        appointmentDate: row.APPOINTMENT_DATE ?? row[4],
        timeNote: row.TIME_NOTE ?? row[5],
        doctorName: row.DOCTOR_NAME ?? row[6],
        departmentName: row.DEPT_NAME ?? row[7],
      }));

      res.json({ success: true, data: appointments, total: appointments.length });
    } catch (oracleErr: any) {
      // Oracle không khả dụng — trả về danh sách rỗng (không còn fallback vào bảng sai)
      logger.warn(`[Patient] Oracle HIS không khả dụng: ${oracleErr.message}`);
      res.json({ success: true, data: [], total: 0, offline: true });
    } finally {
      await conn.close();
    }
  } catch (err) {
    logger.error(`[Patient] GET /appointments: ${err}`);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

// DELETE /api/patient/appointments/:id — Hủy lịch hẹn
// Chỉ cho phép hủy nếu lịch hẹn thuộc SĐT của bệnh nhân đang đăng nhập (bảo mật qua W_LOGIN)
router.delete('/appointments/:id', requirePatient, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const phone = req.patient!.phone;
    const conn = await getConnection();
    try {
      // Kiểm tra ownership: W_HEN.IDLOGIN → W_LOGIN.DTDIDONG phải khớp SĐT bệnh nhân
      const check = await conn.execute<any>(
        `SELECT h.ID, h.DONE FROM MEDI.W_HEN h
         JOIN MEDI.W_LOGIN l ON l.ID = h.IDLOGIN
         WHERE h.ID = :id AND l.DTDIDONG = :phone`,
        { id: Number(id), phone }
      );

      if (!check.rows || check.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Không tìm thấy lịch hẹn hoặc không có quyền hủy' });
        return;
      }

      const done = check.rows[0].DONE ?? check.rows[0][1];
      if (done === 1) {
        res.status(400).json({ success: false, error: 'Lịch hẹn đã hoàn thành, không thể hủy' });
        return;
      }
      if (done === 2) {
        res.status(400).json({ success: false, error: 'Lịch hẹn đã được hủy trước đó' });
        return;
      }

      // DONE = 2 là trạng thái hủy trong W_HEN của hệ thống HIS
      await conn.execute(
        `UPDATE MEDI.W_HEN SET DONE = 2, NGAYUD = SYSDATE WHERE ID = :id`,
        { id: Number(id) },
        { autoCommit: true }
      );

      res.json({ success: true, message: 'Đã hủy lịch hẹn thành công' });
    } catch (oracleErr: any) {
      logger.error(`[Patient] Oracle error khi hủy lịch: ${oracleErr.message}`);
      res.status(500).json({ success: false, error: 'Không thể kết nối hệ thống HIS để hủy lịch hẹn' });
    } finally {
      await conn.close();
    }
  } catch (err) {
    logger.error(`[Patient] DELETE /appointments/:id: ${err}`);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

export default router;
