import { Router, type Request, type Response } from "express";
import { getWebDb } from "../../shared/sqlite";
import { requireAdmin } from "../auth/auth.middleware";
import { logger } from "../../shared/logger";

const router = Router();

// POST /api/reviews — Bệnh nhân gửi đánh giá (public, giới hạn 1 lần/appointment)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { doctor_id, appointment_id, rating, comment, patient_phone } = req.body;

    if (!doctor_id || !rating || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, error: "Thiếu thông tin hoặc đánh giá không hợp lệ (1–5 sao)" });
      return;
    }

    const db = await getWebDb();

    // Ngăn đánh giá trùng cho cùng một lịch hẹn
    if (appointment_id) {
      const existing = await db.get(
        "SELECT id FROM doctor_reviews WHERE appointment_id = ?",
        [String(appointment_id)]
      );
      if (existing) {
        res.status(409).json({ success: false, error: "Lịch hẹn này đã được đánh giá trước đó" });
        return;
      }
    }

    const result = await db.run(
      `INSERT INTO doctor_reviews (doctor_id, appointment_id, rating, comment, patient_phone, is_published)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [String(doctor_id), appointment_id ? String(appointment_id) : null, Number(rating), comment || null, patient_phone || null]
    );

    res.status(201).json({ success: true, data: { id: result.lastID } });
  } catch (err) {
    logger.error("[reviews] POST /: %o", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

// GET /api/reviews/doctor/:doctorId — Lấy đánh giá đã duyệt của bác sĩ (public)
router.get("/doctor/:doctorId", async (req: Request, res: Response) => {
  try {
    const db = await getWebDb();
    const reviews = await db.all(
      `SELECT id, rating, comment, created_at
       FROM doctor_reviews
       WHERE doctor_id = ? AND is_published = 1
       ORDER BY created_at DESC
       LIMIT 20`,
      [req.params.doctorId]
    );

    const stats = await db.get(
      `SELECT COUNT(*) as total, AVG(rating) as avg_rating
       FROM doctor_reviews
       WHERE doctor_id = ? AND is_published = 1`,
      [req.params.doctorId]
    );

    res.json({
      success: true,
      data: reviews,
      stats: {
        total: stats.total || 0,
        avg_rating: stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : 0,
      },
    });
  } catch (err) {
    logger.error("[reviews] GET /doctor/:id: %o", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

// GET /api/reviews — Admin: lấy tất cả đánh giá (chưa duyệt + đã duyệt)
router.get("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await getWebDb();
    const status = req.query.status; // 'pending' | 'published' | undefined (all)
    let sql = "SELECT * FROM doctor_reviews ORDER BY created_at DESC LIMIT 200";
    const params: any[] = [];

    if (status === "pending") {
      sql = "SELECT * FROM doctor_reviews WHERE is_published = 0 ORDER BY created_at DESC LIMIT 200";
    } else if (status === "published") {
      sql = "SELECT * FROM doctor_reviews WHERE is_published = 1 ORDER BY created_at DESC LIMIT 200";
    }

    const reviews = await db.all(sql, params);
    res.json({ success: true, data: reviews, total: reviews.length });
  } catch (err) {
    logger.error("[reviews] GET /: %o", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

// PATCH /api/reviews/:id/approve — Admin: duyệt hoặc bỏ duyệt
router.patch("/:id/approve", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { is_published } = req.body;
    const db = await getWebDb();
    await db.run(
      "UPDATE doctor_reviews SET is_published = ? WHERE id = ?",
      [is_published ? 1 : 0, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    logger.error("[reviews] PATCH /:id/approve: %o", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

// DELETE /api/reviews/:id — Admin: xóa đánh giá
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await getWebDb();
    await db.run("DELETE FROM doctor_reviews WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    logger.error("[reviews] DELETE /:id: %o", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

export default router;
