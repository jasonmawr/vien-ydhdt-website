import { Router } from "express";
import {
  getSpecialties,
  getExamPricing,
  getInsuranceTuyen,
  getPatientTypes,
  getDoctors,
  getDoctorAvailability,
} from "./booking.service";

export const bookingRouter = Router();

// GET /api/booking/doctors
bookingRouter.get("/doctors", async (_req, res) => {
  try {
    const data = await getDoctors();
    res.json({ success: true, data });
  } catch (err) {
    console.error("[Booking] getDoctors error:", err);
    res.status(500).json({ success: false, error: "Lỗi lấy danh mục bác sĩ" });
  }
});

// GET /api/booking/specialties
bookingRouter.get("/specialties", async (_req, res) => {
  try {
    const data = await getSpecialties();
    res.json({ success: true, data });
  } catch (err) {
    console.error("[Booking] getSpecialties error:", err);
    res.status(500).json({ success: false, error: "Lỗi lấy danh mục chuyên khoa" });
  }
});

// GET /api/booking/pricing
bookingRouter.get("/pricing", async (_req, res) => {
  try {
    const data = await getExamPricing();
    res.json({ success: true, data });
  } catch (err) {
    console.error("[Booking] getExamPricing error:", err);
    res.status(500).json({ success: false, error: "Lỗi lấy bảng giá" });
  }
});

// GET /api/booking/insurance-tuyen
bookingRouter.get("/insurance-tuyen", async (_req, res) => {
  try {
    const data = await getInsuranceTuyen();
    res.json({ success: true, data });
  } catch (err) {
    console.error("[Booking] getInsuranceTuyen error:", err);
    res.status(500).json({ success: false, error: "Lỗi lấy danh mục tuyến BHYT" });
  }
});

// GET /api/booking/patient-types
bookingRouter.get("/patient-types", async (_req, res) => {
  try {
    const data = await getPatientTypes();
    res.json({ success: true, data });
  } catch (err) {
    console.error("[Booking] getPatientTypes error:", err);
    res.status(500).json({ success: false, error: "Lỗi lấy đối tượng bệnh nhân" });
  }
});

// GET /api/booking/availability?doctorId=X&date=YYYY-MM-DD
bookingRouter.get("/availability", async (req, res) => {
  try {
    const { doctorId, date } = req.query as { doctorId?: string; date?: string };
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ success: false, error: "Thiếu hoặc sai định dạng date (YYYY-MM-DD)" });
      return;
    }
    const data = await getDoctorAvailability(doctorId || '', date);
    res.json({ success: true, data });
  } catch (err) {
    console.error("[Booking] getAvailability error:", err);
    res.status(500).json({ success: false, error: "Lỗi lấy lịch trống" });
  }
});
