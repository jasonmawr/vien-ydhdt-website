/**
 * @file appointments.router.ts
 * @description Express Router cho module Đặt lịch khám
 * Base path: /api/appointments
 */
import { Router, type Request, type Response } from "express";
import { createAppointment, getAllAppointments } from "./appointments.service";
import { requireAdmin } from "../auth/auth.middleware";

const router = Router();

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
  } catch (err) {
    console.error("[appointments] POST /:", err);
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
    console.error("[appointments] GET /:", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

export default router;
