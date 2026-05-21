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
import sharp from "sharp";

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

    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
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

// GET /api/doctors/:id/image?w=400&q=80 — Stream ảnh BLOB từ Oracle với resize WebP
router.get("/:id/image", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const width = Math.min(Number(req.query.w) || 0, 800);
    const quality = Math.min(Math.max(Number(req.query.q) || 80, 20), 100);
    const cacheKey = width ? `${id}:${width}:${quality}` : id;

    // Kiểm tra cache trước
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < IMAGE_CACHE_TTL) {
      res.set({
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=604800",
        "Content-Length": cached.buffer.length.toString(),
        "X-Cache": "HIT",
      });
      res.send(cached.buffer);
      return;
    }

    const imageBuffer = await getDoctorImage(id);
    if (!imageBuffer) {
      res.status(404).end();
      return;
    }

    let finalBuffer: Buffer;
    let contentType: string;

    if (width) {
      // Resize và convert sang WebP với sharp
      try {
        finalBuffer = await sharp(imageBuffer)
          .resize(width, Math.round(width * 1.25), { fit: "cover", position: "top" })
          .webp({ quality })
          .toBuffer();
        contentType = "image/webp";
      } catch {
        // Fallback nếu sharp thất bại
        finalBuffer = imageBuffer;
        contentType = "image/jpeg";
      }
    } else {
      finalBuffer = imageBuffer;
      // Detect content type
      contentType = "image/jpeg";
      if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) contentType = "image/png";
      else if (imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49) contentType = "image/gif";
    }

    imageCache.set(cacheKey, { buffer: finalBuffer, contentType, cachedAt: Date.now() });

    res.set({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=604800",
      "Content-Length": finalBuffer.length.toString(),
      "X-Cache": "MISS",
    });
    res.send(finalBuffer);
  } catch (err) {
    console.error("[doctors] GET /:id/image:", err);
    res.status(404).end();
  }
});

export default router;
