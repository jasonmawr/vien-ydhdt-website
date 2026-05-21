/**
 * @file appointments.router.ts
 * @description Express Router cho module Đặt lịch khám
 * Base path: /api/appointments
 */
import { Router, type Request, type Response } from "express";
import { createAppointment, getAllAppointments } from "./appointments.service";
import { requireAdmin } from "../auth/auth.middleware";
import { sendEmail, sendAdminNotification } from "../../shared/mailer";
import { sendSMS } from "../../shared/sms";
import { scheduleReminder } from "../../shared/scheduler";
import { sendZaloNotification } from "../notifications/zalo.service";
import { logger } from "../../shared/logger";

const router = Router();

function makeReviewToken(appointmentId: string | number, doctorId: string | number): string {
  const raw = `${appointmentId}|${doctorId}`;
  return Buffer.from(raw).toString("base64url");
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Theo lịch hẹn';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// POST /api/appointments — Tạo lịch hẹn mới
router.post("/", async (req: Request, res: Response) => {
  try {
    const { patientName, patientPhone } = req.body;

    if (!patientName || !patientPhone) {
      res.status(400).json({
        success: false,
        error: "Thiếu thông tin bắt buộc: Họ tên và Số điện thoại.",
      });
      return;
    }

    const result = await createAppointment(req.body);
    res.status(201).json(result);

    // Fire-and-forget notifications — không block response
    if (result.success) {
      const payload = req.body;
      const appointmentId = result.data?.id || '';
      const stt = String(result.data?.stt || '—');
      const doctorName = payload.doctorName || 'Bác sĩ trực';
      const doctorId = payload.doctorId || payload.doctor_id || '';
      const departmentName = payload.departmentName || 'Khoa khám';
      const appointmentDate = formatDate(payload.appointmentDate);
      const appointmentTime = payload.appointmentTime || 'Theo lịch';
      const year = new Date().getFullYear().toString();
      const reviewUrl = doctorId
        ? `${process.env.FRONTEND_URL || 'https://vienydhdt.gov.vn'}/danh-gia/${makeReviewToken(appointmentId, doctorId)}`
        : null;

      const notifications: Promise<any>[] = [];

      // Email xác nhận cho bệnh nhân
      if (payload.patientEmail) {
        notifications.push(
          sendEmail({
            to: payload.patientEmail,
            subject: `[Viện YDHDT] Xác nhận lịch hẹn - ${appointmentDate}`,
            templateName: 'appointment-confirm',
            variables: {
              patientName,
              doctorName,
              departmentName,
              appointmentDate,
              appointmentTime,
              stt,
              cancelUrl: `${process.env.FRONTEND_URL || 'https://vienydhdt.gov.vn'}/tra-cuu?cancel=${appointmentId}`,
              reviewUrl: reviewUrl || '',
              year,
            },
          }).catch(err => logger.error(`[Notifications] Email lỗi: ${err}`))
        );
      }

      // SMS xác nhận cho bệnh nhân
      if (patientPhone) {
        const smsConfirm = `[VienYDHDT] Lich hen ${appointmentDate} ${appointmentTime} voi BS ${doctorName} da duoc xac nhan. STT: ${stt}. Hotline: 0964392632`;
        notifications.push(
          sendSMS(patientPhone, smsConfirm)
            .catch(err => logger.error(`[Notifications] SMS xác nhận lỗi: ${err}`))
        );

        // SMS reminder 24h trước
        if (payload.appointmentDate) {
          notifications.push(
            scheduleReminder({
              phone: patientPhone,
              appointmentDate: payload.appointmentDate,
              appointmentTime: payload.appointmentTime || '07:00',
              patientName,
              doctorName,
              appointmentId,
            }).catch(err => logger.error(`[Notifications] Schedule reminder lỗi: ${err}`))
          );
        }
      }

      // Email thông báo admin
      if (process.env.ADMIN_NOTIFY_EMAILS) {
        const adminHtml = `
          <div style="font-family:Arial,sans-serif;padding:20px;background:#f5f5f5">
            <div style="background:#fff;padding:24px;border-radius:12px;max-width:500px">
              <h2 style="color:#1e3a5f;margin:0 0 16px">🔔 Lịch hẹn mới</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 4px;color:#888;width:130px">Bệnh nhân</td><td style="font-weight:700">${patientName}</td></tr>
                <tr><td style="padding:8px 4px;color:#888">SĐT</td><td style="font-weight:700">${patientPhone}</td></tr>
                <tr><td style="padding:8px 4px;color:#888">Bác sĩ</td><td>${doctorName}</td></tr>
                <tr><td style="padding:8px 4px;color:#888">Chuyên khoa</td><td>${departmentName}</td></tr>
                <tr><td style="padding:8px 4px;color:#888">Ngày</td><td>${appointmentDate}</td></tr>
                <tr><td style="padding:8px 4px;color:#888">Giờ</td><td>${appointmentTime}</td></tr>
                <tr><td style="padding:8px 4px;color:#888">Mã hẹn</td><td style="font-family:monospace">${appointmentId}</td></tr>
              </table>
            </div>
          </div>
        `;
        notifications.push(
          sendAdminNotification(`[Viện YDHDT] Lịch hẹn mới — ${patientName}`, adminHtml)
            .catch(err => logger.error(`[Notifications] Email admin lỗi: ${err}`))
        );
      }

      // Zalo ZNS — kênh ưu tiên cao hơn SMS
      notifications.push(
        sendZaloNotification(patientPhone, {
          patient_name: patientName,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          department_name: departmentName,
          stt: Number(stt) || 0,
          appointment_id: appointmentId,
        }).catch(err => logger.error(`[Notifications] Zalo ZNS lỗi: ${err}`))
      );

      Promise.allSettled(notifications);
    }
  } catch (err) {
    logger.error("[appointments] POST /: %o", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

// GET /api/appointments — Lấy danh sách (dành cho Admin)
router.get("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const appointments = await getAllAppointments(limit);
    res.json({ success: true, data: appointments, total: appointments.length });
  } catch (err) {
    logger.error("[appointments] GET /: %o", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

// GET /api/appointments/export — Xuất CSV (Admin only)
router.get("/export", requireAdmin, async (req: Request, res: Response) => {
  try {
    const rows = (await getAllAppointments(10000)) as any[];

    const headers = [
      'ID', 'Họ tên', 'Điện thoại', 'Ngày sinh', 'Giới tính',
      'Khoa', 'Bác sĩ', 'Ngày hẹn', 'Giờ hẹn', 'Triệu chứng',
      'Trạng thái', 'Ngày tạo',
    ];

    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;

    const csvRows = rows.map((r: any) => [
      escape(r.ID      ?? r[0]),
      escape(r.PATIENT_NAME  ?? r[1]),
      escape(r.PATIENT_PHONE ?? r[2]),
      escape(r.PATIENT_DOB   ?? r[3]),
      escape(r.PATIENT_GENDER ?? r[4]),
      escape(r.DEPARTMENT_ID  ?? r[5]),
      escape(r.DOCTOR_ID      ?? r[6]),
      escape(r.APPOINTMENT_DATE ?? r[7]),
      escape(r.APPOINTMENT_TIME ?? r[8]),
      escape(r.SYMPTOMS  ?? r[9]),
      escape(r.STATUS    ?? r[10]),
      escape(r.CREATED_AT ?? r[11]),
    ].join(','));

    const csv = [headers.map(h => `"${h}"`).join(','), ...csvRows].join('\r\n');
    const date = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="appointments_${date}.csv"`);
    res.send('﻿' + csv); // BOM cho Excel đọc UTF-8 đúng
  } catch (err) {
    logger.error("[appointments] GET /export: %o", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

export default router;
