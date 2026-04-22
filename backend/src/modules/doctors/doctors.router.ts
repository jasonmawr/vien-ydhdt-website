/**
 * @file doctors.router.ts
 * @description Express Router cho module Bác sĩ
 * Base path: /api/doctors
 */
import { Router, type Request, type Response } from "express";
import {
  getAllDoctors,
  getFeaturedDoctors,
  getDoctorById,
  getDoctorImage,
  getDoctorsByDepartment,
} from "./doctors.service";

const router = Router();

// In-memory cache ảnh bác sĩ — tránh gọi Oracle BLOB liên tục
const imageCache = new Map<string, { buffer: Buffer; contentType: string; cachedAt: number }>();
const IMAGE_CACHE_TTL = 3600_000; // 1 giờ

// GET /api/doctors?featured=true&limit=8&department=1
router.get("/", async (req: Request, res: Response) => {
  try {
    const { featured, limit, department } = req.query;

    let doctors;
    if (department) {
      doctors = await getDoctorsByDepartment(Number(department));
    } else if (featured === "true") {
      doctors = await getFeaturedDoctors(Number(limit) || 8);
    } else {
      doctors = await getAllDoctors(limit ? Number(limit) : undefined);
    }

    res.json({ success: true, data: doctors, total: doctors.length });
  } catch (err) {
    console.error("[doctors] GET /:", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

// GET /api/doctors/:id — Chi tiết bác sĩ
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const doctor = await getDoctorById(req.params.id);
    if (!doctor) {
      res.status(404).json({ success: false, error: "Không tìm thấy bác sĩ" });
      return;
    }
    res.json({ success: true, data: doctor });
  } catch (err) {
    console.error("[doctors] GET /:id:", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

// GET /api/doctors/:id/image — Stream ảnh BLOB từ Oracle (có cache)
router.get("/:id/image", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    // Kiểm tra cache trước
    const cached = imageCache.get(id);
    if (cached && Date.now() - cached.cachedAt < IMAGE_CACHE_TTL) {
      res.set({
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=86400",
        "Content-Length": cached.buffer.length.toString(),
        "X-Cache": "HIT",
      });
      res.send(cached.buffer);
      return;
    }

    const imageBuffer = await getDoctorImage(id);

    if (!imageBuffer) {
      res.status(204).end(); // No Content — tránh redirect loop
      return;
    }

    // Detect content type từ magic bytes
    let contentType = "image/jpeg";
    if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
      contentType = "image/png";
    } else if (imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49) {
      contentType = "image/gif";
    }

    // Lưu vào cache
    imageCache.set(id, { buffer: imageBuffer, contentType, cachedAt: Date.now() });

    res.set({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
      "Content-Length": imageBuffer.length.toString(),
      "X-Cache": "MISS",
    });
    res.send(imageBuffer);
  } catch (err) {
    console.error("[doctors] GET /:id/image:", err);
    res.status(204).end();
  }
});

export default router;
