/**
 * @file qna.router.ts
 * @description Express Router cho phân hệ Hỏi & Đáp (Q&A Interactive Portal).
 * Base path: /api/qna
 */
import { Router, type Request, type Response } from "express";
import { getWebDb } from "../../shared/sqlite";
import { requireAdmin, requireAnyAdmin } from "../auth/auth.middleware";

const router = Router();

// ==========================================
// ─── NHÓM 1: APIS DÀNH CHO NGƯỜI DÙNG CÔNG CỘNG (CLIENT)
// ==========================================

/**
 * POST /api/qna
 * Người bệnh gửi câu hỏi mới từ trang Liên hệ/Hỏi đáp
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    if (!name || !phone || !subject || !message) {
      res.status(400).json({
        success: false,
        error: "Vui lòng nhập đầy đủ các trường bắt buộc (Họ tên, SĐT, Chủ đề, Nội dung).",
      });
      return;
    }

    if (phone.length < 10 || phone.length > 11) {
      res.status(400).json({
        success: false,
        error: "Số điện thoại không hợp lệ (cần từ 10-11 ký tự).",
      });
      return;
    }

    const db = await getWebDb();
    await db.run(
      `INSERT INTO patient_qnas (name, phone, email, subject, message, is_answered, is_public)
       VALUES (?, ?, ?, ?, ?, 0, 0)`,
      [name.trim(), phone.trim(), email ? email.trim() : null, subject.trim(), message.trim()]
    );

    res.json({
      success: true,
      message: "Gửi câu hỏi thành công! Ban tư vấn y khoa sẽ phản hồi sớm nhất có thể.",
    });
  } catch (err) {
    console.error("[Q&A] POST /:", err);
    res.status(500).json({
      success: false,
      error: "Không thể gửi câu hỏi lúc này. Vui lòng liên hệ hotline.",
    });
  }
});

/**
 * GET /api/qna
 * Lấy danh sách các câu hỏi y khoa đã được bác sĩ trả lời và cấu hình CÔNG KHAI
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { search, subject } = req.query;
    const db = await getWebDb();

    let query = "SELECT id, name, subject, message, answer, answered_by, answered_at, created_at FROM patient_qnas WHERE is_public = 1";
    const params: any[] = [];

    if (search) {
      query += " AND (message LIKE ? OR answer LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (subject) {
      query += " AND subject = ?";
      params.push(subject);
    }

    query += " ORDER BY answered_at DESC";

    const rows = await db.all(query, ...params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[Q&A] GET /:", err);
    res.status(500).json({ success: false, error: "Lỗi tải danh sách Hỏi & Đáp y khoa." });
  }
});


// ==========================================
// ─── NHÓM 2: APIS QUẢN TRỊ ADMIN (YÊU CẦU AUTH/RBAC)
// ==========================================

/**
 * GET /api/qna/admin
 * Lấy danh sách toàn bộ câu hỏi của bệnh nhân (Yêu cầu VIEWER trở lên)
 */
router.get("/admin", requireAnyAdmin, async (req: Request, res: Response) => {
  try {
    const { search, subject, is_answered, is_public } = req.query;
    const db = await getWebDb();

    let query = "SELECT * FROM patient_qnas WHERE 1=1";
    const params: any[] = [];

    if (search) {
      query += " AND (name LIKE ? OR phone LIKE ? OR message LIKE ? OR answer LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (subject) {
      query += " AND subject = ?";
      params.push(subject);
    }

    if (is_answered !== undefined && is_answered !== "") {
      query += " AND is_answered = ?";
      params.push(is_answered === "true" || is_answered === "1" ? 1 : 0);
    }

    if (is_public !== undefined && is_public !== "") {
      query += " AND is_public = ?";
      params.push(is_public === "true" || is_public === "1" ? 1 : 0);
    }

    query += " ORDER BY created_at DESC";

    const rows = await db.all(query, ...params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[Q&A] GET /admin:", err);
    res.status(500).json({ success: false, error: "Lỗi lấy danh sách câu hỏi quản trị." });
  }
});

/**
 * PUT /api/qna/admin/:id
 * Duyệt, trả lời hoặc cập nhật câu hỏi y tế (Yêu cầu ADMIN trở lên)
 */
router.put("/admin/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answer, answered_by, is_public } = req.body;

    if (!answer || answer.trim().length === 0) {
      res.status(400).json({ success: false, error: "Vui lòng nhập câu trả lời y tế." });
      return;
    }

    const db = await getWebDb();
    const existing = await db.get("SELECT id FROM patient_qnas WHERE id = ?", id);
    if (!existing) {
      res.status(404).json({ success: false, error: "Không tìm thấy câu hỏi Hỏi & Đáp cần sửa." });
      return;
    }

    const doctorName = answered_by || req.user?.username || "Bác sĩ Chuyên khoa";

    await db.run(
      `UPDATE patient_qnas
       SET answer = ?, 
           answered_by = ?, 
           answered_at = CURRENT_TIMESTAMP, 
           is_answered = 1, 
           is_public = ?
       WHERE id = ?`,
      [answer.trim(), doctorName.trim(), is_public ? 1 : 0, id]
    );

    res.json({ success: true, message: "Cập nhật câu trả lời Hỏi & Đáp thành công!" });
  } catch (err) {
    console.error("[Q&A] PUT /admin/:id:", err);
    res.status(500).json({ success: false, error: "Lỗi lưu phản hồi của bác sĩ." });
  }
});

/**
 * DELETE /api/qna/admin/:id
 * Xóa câu hỏi khỏi cơ sở dữ liệu (Yêu cầu ADMIN trở lên)
 */
router.delete("/admin/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getWebDb();

    const result = await db.run("DELETE FROM patient_qnas WHERE id = ?", id);
    if (result.changes === 0) {
      res.status(404).json({ success: false, error: "Không tìm thấy câu hỏi cần xóa." });
      return;
    }

    res.json({ success: true, message: "Đã xóa câu hỏi khỏi cơ sở dữ liệu thành công." });
  } catch (err) {
    console.error("[Q&A] DELETE /admin/:id:", err);
    res.status(500).json({ success: false, error: "Lỗi xóa câu hỏi." });
  }
});

export default router;
