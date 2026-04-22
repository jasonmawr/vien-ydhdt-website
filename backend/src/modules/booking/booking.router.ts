import { Router } from "express";
import {
  getSpecialties,
  getExamPricing,
  getInsuranceTuyen,
  getPatientTypes,
} from "./booking.service";

export const bookingRouter = Router();

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
