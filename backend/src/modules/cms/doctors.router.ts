import { Router } from "express";
import { getWebDb } from "../../shared/sqlite";
import { requireAdmin } from "../auth/auth.middleware";

const router = Router();

// Lấy thông tin Web của bác sĩ theo mã
router.get("/:mabs", async (req, res) => {
  try {
    const db = await getWebDb();
    const { mabs } = req.params;
    const doctor = await db.get("SELECT * FROM web_doctors WHERE mabs = ?", [mabs]);
    
    res.json({ success: true, data: doctor || null });
  } catch (err) {
    console.error("[Web Doctors] GET /:mabs error:", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

// Cập nhật thông tin Web của bác sĩ (Dành cho Admin)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const db = await getWebDb();
    const { mabs, avatar_url, bio, experience_years, special_titles } = req.body;

    if (!mabs) {
      res.status(400).json({ success: false, error: "Thiếu mã bác sĩ" });
      return;
    }

    // Upsert
    await db.run(`
      INSERT INTO web_doctors (mabs, avatar_url, bio, experience_years, special_titles, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(mabs) DO UPDATE SET
        avatar_url=excluded.avatar_url,
        bio=excluded.bio,
        experience_years=excluded.experience_years,
        special_titles=excluded.special_titles,
        updated_at=CURRENT_TIMESTAMP
    `, [mabs, avatar_url || null, bio || null, experience_years || null, special_titles || null]);

    res.json({ success: true, message: "Cập nhật hồ sơ bác sĩ thành công" });
  } catch (err) {
    console.error("[Web Doctors] POST / error:", err);
    res.status(500).json({ success: false, error: "Lỗi máy chủ" });
  }
});

export default router;
