/**
 * @file chatbot.router.ts
 * @description Express Router cho phân hệ AI Chatbot & Quản trị Chatbot CMS.
 * Base path: /api/chatbot
 */
import { Router, type Request, type Response } from "express";
import { processMessage, getSessionHistory } from "./chatbot.service";
import { getWebDb } from "../../shared/sqlite";
import { requireAdmin, requireAnyAdmin } from "../auth/auth.middleware";

const router = Router();

// ==========================================
// ─── NHÓM 1: APIS DÀNH CHO NGƯỜI DÙNG CÔNG CỘNG (CLIENT)
// ==========================================

/**
 * POST /api/chatbot/message
 * Nhận tin nhắn và trả lời từ trợ lý ảo AI
 */
router.post("/message", async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: "Vui lòng nhập nội dung tin nhắn.",
      });
      return;
    }

    if (message.length > 1000) {
      res.status(400).json({
        success: false,
        error: "Tin nhắn quá dài. Vui lòng giới hạn dưới 1000 ký tự.",
      });
      return;
    }

    const result = await processMessage(
      {
        message: message.trim(),
        sessionId,
      },
      req.ip,
      req.headers["user-agent"] as string
    );

    res.json({
      success: true,
      reply: result.reply,
      sessionId: result.sessionId,
      suggestedQuestions: result.suggestedQuestions,
    });
  } catch (err) {
    console.error("[chatbot] POST /message:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi xử lý tin nhắn từ AI.",
    });
  }
});

/**
 * GET /api/chatbot/history?sessionId=xxx
 * Lấy lịch sử hội thoại của phiên chat
 */
router.get("/history", async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      res.status(400).json({ success: false, error: "Thiếu sessionId" });
      return;
    }

    const history = await getSessionHistory(sessionId);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: "Không thể lấy lịch sử chat." });
  }
});

/**
 * POST /api/chatbot/conversations/:sessionId/feedback
 * Nhận phản hồi Thích (👍) / Không thích (👎) từ người dùng ngoài trang chủ
 */
router.post("/conversations/:sessionId/feedback", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { rating, feedbackNotes } = req.body; // rating: 1 (like), -1 (dislike)

    if (rating !== 1 && rating !== -1 && rating !== null) {
      res.status(400).json({ success: false, error: "Rating không hợp lệ." });
      return;
    }

    const db = await getWebDb();
    const result = await db.run(
      "UPDATE chatbot_conversations SET rating = ?, feedback_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?",
      rating,
      feedbackNotes || null,
      sessionId
    );

    if (result.changes === 0) {
      // Nếu phiên chat chưa có trong DB (tình huống hiếm), tự động tạo mới
      await db.run(
        "INSERT INTO chatbot_conversations (session_id, rating, feedback_notes) VALUES (?, ?, ?)",
        sessionId,
        rating,
        feedbackNotes || null
      );
    }

    res.json({ success: true, message: "Đã lưu nhận xét phản hồi thành công." });
  } catch (err) {
    console.error("[chatbot] POST /feedback:", err);
    res.status(500).json({ success: false, error: "Lỗi lưu phản hồi." });
  }
});

/**
 * GET /api/chatbot/health
 * Kiểm tra trạng thái Gemini API key
 */
router.get("/health", (_req: Request, res: Response) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  res.json({
    success: true,
    status: hasApiKey ? "ready" : "no_api_key",
    message: hasApiKey
      ? "AI Chatbot sẵn sàng hoạt động"
      : "Chưa cấu hình GEMINI_API_KEY — chatbot sẽ trả lời bằng fallback",
  });
});

// ==========================================
// ─── NHÓM 2: APIS QUẢN TRỊ ADMIN (YÊU CẦU AUTH/RBAC)
// ==========================================

/**
 * GET /api/chatbot/admin/config
 * Lấy toàn bộ cấu hình chatbot hiện tại (Yêu cầu VIEWER trở lên)
 */
router.get("/admin/config", requireAnyAdmin, async (_req: Request, res: Response) => {
  try {
    const db = await getWebDb();
    const rows = await db.all("SELECT key, value FROM chatbot_configs");
    const configObj: Record<string, string> = {};
    rows.forEach((row) => {
      configObj[row.key] = row.value;
    });

    res.json({ success: true, data: configObj });
  } catch (err) {
    res.status(500).json({ success: false, error: "Lỗi lấy cấu hình chatbot." });
  }
});

/**
 * POST /api/chatbot/admin/config
 * Cập nhật cấu hình chatbot (Yêu cầu ADMIN trở lên)
 */
router.post("/admin/config", requireAdmin, async (req: Request, res: Response) => {
  try {
    const configs = req.body; // JSON object { system_prompt: '...', welcome_message: '...' }
    const db = await getWebDb();
    const adminUser = req.user?.username || "Admin";

    for (const [key, value] of Object.entries(configs)) {
      if (typeof value === "string" || typeof value === "number") {
        await db.run(
          `INSERT INTO chatbot_configs (key, value, updated_at, updated_by)
           VALUES (?, ?, CURRENT_TIMESTAMP, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP, updated_by = ?`,
          key,
          String(value),
          adminUser,
          adminUser
        );
      }
    }

    res.json({ success: true, message: "Đã lưu cấu hình chatbot thành công." });
  } catch (err) {
    console.error("[chatbot] POST /admin/config:", err);
    res.status(500).json({ success: false, error: "Lỗi lưu cấu hình." });
  }
});

/**
 * GET /api/chatbot/admin/knowledge
 * Lấy danh sách tri thức RAG/FAQ (Yêu cầu VIEWER trở lên)
 */
router.get("/admin/knowledge", requireAnyAdmin, async (req: Request, res: Response) => {
  try {
    const { search, type, is_active } = req.query;
    const db = await getWebDb();

    let query = "SELECT * FROM chatbot_knowledge WHERE 1=1";
    const params: any[] = [];

    if (search) {
      query += " AND (title LIKE ? OR content LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (type) {
      query += " AND source_type = ?";
      params.push(type);
    }

    if (is_active !== undefined) {
      query += " AND is_active = ?";
      params.push(is_active === "true" || is_active === "1" ? 1 : 0);
    }

    query += " ORDER BY updated_at DESC";

    const rows = await db.all(query, ...params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: "Lỗi lấy danh sách tri thức." });
  }
});

/**
 * POST /api/chatbot/admin/knowledge
 * Thêm mới một bản ghi tri thức FAQ/Tài liệu (Yêu cầu ADMIN trở lên)
 */
router.post("/admin/knowledge", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { source_type, title, content, is_active, source_reference } = req.body;

    if (!title || !content || !source_type) {
      res.status(400).json({ success: false, error: "Vui lòng nhập đầy đủ loại, tiêu đề và nội dung." });
      return;
    }

    const id = `kb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const db = await getWebDb();

    await db.run(
      `INSERT INTO chatbot_knowledge (id, source_type, source_reference, title, content, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      source_type,
      source_reference || null,
      title,
      content,
      is_active === false ? 0 : 1
    );

    res.json({ success: true, id, message: "Đã thêm tri thức chatbot thành công." });
  } catch (err) {
    console.error("[chatbot] POST /admin/knowledge:", err);
    res.status(500).json({ success: false, error: "Lỗi thêm tri thức mới." });
  }
});

/**
 * PUT /api/chatbot/admin/knowledge/:id
 * Cập nhật tri thức chatbot (Yêu cầu ADMIN trở lên)
 */
router.put("/admin/knowledge/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, is_active } = req.body;

    if (!title || !content) {
      res.status(400).json({ success: false, error: "Tiêu đề và nội dung không được bỏ trống." });
      return;
    }

    const db = await getWebDb();
    const result = await db.run(
      `UPDATE chatbot_knowledge 
       SET title = ?, content = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      title,
      content,
      is_active === false ? 0 : 1,
      id
    );

    if (result.changes === 0) {
      res.status(404).json({ success: false, error: "Không tìm thấy tri thức cần cập nhật." });
      return;
    }

    res.json({ success: true, message: "Đã cập nhật tri thức thành công." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Lỗi cập nhật bản ghi." });
  }
});

/**
 * DELETE /api/chatbot/admin/knowledge/:id
 * Xóa một bản ghi tri thức (Yêu cầu ADMIN trở lên)
 */
router.delete("/api/chatbot/admin/knowledge/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getWebDb();

    const result = await db.run("DELETE FROM chatbot_knowledge WHERE id = ?", id);
    if (result.changes === 0) {
      res.status(404).json({ success: false, error: "Không tìm thấy bản ghi cần xóa." });
      return;
    }

    res.json({ success: true, message: "Đã xóa tri thức chatbot thành công." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Lỗi xóa tri thức." });
  }
});

/**
 * GET /api/chatbot/admin/conversations
 * Lấy danh sách các cuộc trò chuyện (lịch sử session) của bệnh nhân (Yêu cầu VIEWER trở lên)
 */
router.get("/admin/conversations", requireAnyAdmin, async (req: Request, res: Response) => {
  try {
    const { rating, limit, offset } = req.query;
    const db = await getWebDb();

    const limitVal = parseInt(limit as string) || 20;
    const offsetVal = parseInt(offset as string) || 0;

    let query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM chatbot_messages WHERE session_id = c.session_id) as message_count,
        (SELECT content FROM chatbot_messages WHERE session_id = c.session_id AND role = 'user' ORDER BY id ASC LIMIT 1) as first_message
      FROM chatbot_conversations c
      WHERE 1=1
    `;
    const params: any[] = [];

    if (rating !== undefined && rating !== "") {
      query += " AND c.rating = ?";
      params.push(parseInt(rating as string));
    }

    query += " ORDER BY c.updated_at DESC LIMIT ? OFFSET ?";
    params.push(limitVal, offsetVal);

    const rows = await db.all(query, ...params);

    const totalRow = await db.get(
      "SELECT COUNT(*) as count FROM chatbot_conversations WHERE 1=1" +
        (rating !== undefined && rating !== "" ? " AND rating = ?" : ""),
      ...(rating !== undefined && rating !== "" ? [parseInt(rating as string)] : [])
    );

    res.json({
      success: true,
      data: rows,
      total: totalRow ? totalRow.count : 0,
    });
  } catch (err) {
    console.error("[chatbot] GET /conversations:", err);
    res.status(500).json({ success: false, error: "Lỗi lấy danh sách hội thoại." });
  }
});

/**
 * GET /api/chatbot/admin/conversations/:sessionId
 * Xem chi tiết logs chat của cuộc hội thoại (Yêu cầu VIEWER trở lên)
 */
router.get("/admin/conversations/:sessionId", requireAnyAdmin, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const db = await getWebDb();

    const conversation = await db.get(
      "SELECT * FROM chatbot_conversations WHERE session_id = ?",
      sessionId
    );
    if (!conversation) {
      res.status(404).json({ success: false, error: "Không tìm thấy cuộc trò chuyện này." });
      return;
    }

    const messages = await db.all(
      "SELECT role, content, timestamp FROM chatbot_messages WHERE session_id = ? ORDER BY id ASC",
      sessionId
    );

    res.json({
      success: true,
      conversation,
      messages,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Lỗi lấy chi tiết cuộc trò chuyện." });
  }
});

/**
 * GET /api/chatbot/admin/analytics
 * Thống kê dữ liệu tin nhắn, phiên chat, rating hài lòng (Yêu cầu VIEWER trở lên)
 */
router.get("/admin/analytics", requireAnyAdmin, async (_req: Request, res: Response) => {
  try {
    const db = await getWebDb();

    // 1. Thống kê số lượng tổng thể
    const totalChats = await db.get("SELECT COUNT(*) as count FROM chatbot_conversations");
    const totalMessages = await db.get("SELECT COUNT(*) as count FROM chatbot_messages");
    const totalUnresolved = await db.get("SELECT COUNT(*) as count FROM chatbot_unresolved WHERE is_resolved = 0");
    const totalKnowledge = await db.get("SELECT COUNT(*) as count FROM chatbot_knowledge");

    const satisfaction = await db.get(`
      SELECT 
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as likes,
        SUM(CASE WHEN rating = -1 THEN 1 ELSE 0 END) as dislikes
      FROM chatbot_conversations
    `);

    // 2. Lượng tin nhắn tương tác theo ngày (14 ngày gần nhất)
    const dailyInteractions = await db.all(`
      SELECT 
        strftime('%d/%m', datetime(timestamp / 1000, 'unixepoch', 'localtime')) as date,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_msg,
        SUM(CASE WHEN role = 'assistant' THEN 1 ELSE 0 END) as bot_msg
      FROM chatbot_messages
      WHERE timestamp >= ?
      GROUP BY date
      ORDER BY timestamp ASC
      LIMIT 14
    `, Date.now() - 14 * 24 * 60 * 60 * 1000);

    // 3. Top các câu hỏi/từ khóa phổ biến nhất
    const userMessages = await db.all(
      "SELECT content FROM chatbot_messages WHERE role = 'user' ORDER BY id DESC LIMIT 200"
    );

    const keywordCounts: Record<string, number> = {};
    const keywordsToFind = ["đặt lịch", "khám", "giờ làm", "bhyt", "bảo hiểm", "bác sĩ", "chi phí", "giá", "địa chỉ", "khoa"];
    
    userMessages.forEach((msg) => {
      const contentLower = msg.content.toLowerCase();
      keywordsToFind.forEach((keyword) => {
        if (contentLower.includes(keyword)) {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        }
      });
    });

    const popularKeywords = Object.entries(keywordCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    res.json({
      success: true,
      summary: {
        totalChats: totalChats ? totalChats.count : 0,
        totalMessages: totalMessages ? totalMessages.count : 0,
        likes: satisfaction ? satisfaction.likes || 0 : 0,
        dislikes: satisfaction ? satisfaction.dislikes || 0 : 0,
        unresolvedCount: totalUnresolved ? totalUnresolved.count : 0,
        knowledgeCount: totalKnowledge ? totalKnowledge.count : 0,
      },
      dailyInteractions,
      popularKeywords,
    });
  } catch (err) {
    console.error("[chatbot] GET /admin/analytics:", err);
    res.status(500).json({ success: false, error: "Lỗi tính toán dữ liệu thống kê." });
  }
});

/**
 * POST /api/chatbot/admin/knowledge/sync-cms
 * Đồng bộ hóa toàn bộ bài viết CMS hiện có thành dữ liệu RAG cho Chatbot (Yêu cầu ADMIN trở lên)
 */
router.post("/admin/knowledge/sync-cms", requireAdmin, async (req: Request, res: Response) => {
  try {
    const db = await getWebDb();

    // Lấy các bài viết đã xuất bản
    const publishedPosts = await db.all(
      "SELECT id, title, excerpt, content FROM posts WHERE status = 'published'"
    );

    const activeCmsIds = publishedPosts.map(p => `cms-${p.id}`);

    // Dọn dẹp các bài viết đã bị xóa hoặc chuyển thành nháp (Purge) khỏi tri thức Chatbot
    if (activeCmsIds.length > 0) {
      const placeholders = activeCmsIds.map(() => '?').join(',');
      await db.run(
        `DELETE FROM chatbot_knowledge 
         WHERE source_type = 'cms_post' AND id NOT IN (${placeholders})`,
        ...activeCmsIds
      );
    } else {
      await db.run("DELETE FROM chatbot_knowledge WHERE source_type = 'cms_post'");
    }

    let syncCount = 0;

    for (const post of publishedPosts) {
      const knowledgeId = `cms-${post.id}`;
      // Clean HTML tags to fit tokens and format cleanly for Gemini prompt
      const plainContent = post.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      const RAGText = post.excerpt ? `${post.excerpt}\n${plainContent}` : plainContent;

      await db.run(
        `INSERT INTO chatbot_knowledge (id, source_type, source_reference, title, content, is_active, updated_at)
         VALUES (?, 'cms_post', ?, ?, ?, 1, CURRENT_TIMESTAMP)
         ON CONFLICT(id) DO UPDATE SET 
           title = excluded.title,
           content = excluded.content,
           updated_at = CURRENT_TIMESTAMP`,
        knowledgeId,
        String(post.id),
        post.title,
        RAGText
      );
      syncCount++;
    }

    res.json({
      success: true,
      message: `Đồng bộ hóa thành công ${syncCount} bài viết đăng trên CMS vào tri thức Chatbot AI.`,
    });
  } catch (err) {
    console.error("[chatbot] POST /knowledge/sync-cms:", err);
    res.status(500).json({ success: false, error: "Lỗi đồng bộ hóa dữ liệu từ CMS." });
  }
});

// ==========================================
// ─── NHÓM 3: APIS LỊCH KHÁM & CÂU HỎI CHƯA GIẢI QUYẾT (CLINIC SCHEDULES & UNRESOLVED)
// ==========================================

/**
 * GET /api/chatbot/admin/schedules
 * Lấy danh sách lịch khám (Yêu cầu VIEWER trở lên)
 */
router.get("/admin/schedules", requireAnyAdmin, async (_req: Request, res: Response) => {
  try {
    const db = await getWebDb();
    const rows = await db.all("SELECT * FROM chatbot_schedules ORDER BY updated_at DESC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: "Lỗi lấy danh sách lịch khám." });
  }
});

/**
 * POST /api/chatbot/admin/schedules
 * Thêm mới lịch khám (Yêu cầu ADMIN trở lên)
 */
router.post("/admin/schedules", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, content, is_active } = req.body;
    if (!title || !content) {
      res.status(400).json({ success: false, error: "Tiêu đề và nội dung lịch khám là bắt buộc." });
      return;
    }

    const id = `sched-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const db = await getWebDb();

    await db.run(
      `INSERT INTO chatbot_schedules (id, title, content, is_active) VALUES (?, ?, ?, ?)`,
      id,
      title,
      content,
      is_active === false ? 0 : 1
    );

    res.json({ success: true, id, message: "Đã thêm lịch khám mới thành công." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Lỗi thêm lịch khám mới." });
  }
});

/**
 * PUT /api/chatbot/admin/schedules/:id
 * Cập nhật lịch khám (Yêu cầu ADMIN trở lên)
 */
router.put("/admin/schedules/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, is_active } = req.body;

    if (!title || !content) {
      res.status(400).json({ success: false, error: "Tiêu đề và nội dung là bắt buộc." });
      return;
    }

    const db = await getWebDb();
    const result = await db.run(
      `UPDATE chatbot_schedules SET title = ?, content = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      title,
      content,
      is_active === false ? 0 : 1,
      id
    );

    if (result.changes === 0) {
      res.status(404).json({ success: false, error: "Không tìm thấy lịch trực cần sửa." });
      return;
    }

    res.json({ success: true, message: "Đã cập nhật lịch trực thành công." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Lỗi cập nhật lịch khám." });
  }
});

/**
 * DELETE /api/chatbot/admin/schedules/:id
 * Xóa lịch trực (Yêu cầu ADMIN trở lên)
 */
router.delete("/api/chatbot/admin/schedules/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getWebDb();

    const result = await db.run("DELETE FROM chatbot_schedules WHERE id = ?", id);
    if (result.changes === 0) {
      res.status(404).json({ success: false, error: "Không tìm thấy lịch khám cần xóa." });
      return;
    }

    res.json({ success: true, message: "Đã xóa lịch trực thành công." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Lỗi xóa lịch trực." });
  }
});

/**
 * GET /api/chatbot/admin/unresolved
 * Lấy danh sách câu hỏi cần bổ sung (Yêu cầu VIEWER trở lên)
 */
router.get("/admin/unresolved", requireAnyAdmin, async (_req: Request, res: Response) => {
  try {
    const db = await getWebDb();
    const rows = await db.all("SELECT * FROM chatbot_unresolved WHERE is_resolved = 0 ORDER BY created_at DESC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: "Lỗi lấy danh sách câu hỏi." });
  }
});

/**
 * POST /api/chatbot/admin/unresolved/:id/resolve
 * Đánh dấu câu hỏi đã giải quyết (Yêu cầu ADMIN trở lên)
 */
router.post("/admin/unresolved/:id/resolve", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getWebDb();

    const result = await db.run("UPDATE chatbot_unresolved SET is_resolved = 1 WHERE id = ?", id);
    if (result.changes === 0) {
      res.status(404).json({ success: false, error: "Không tìm thấy câu hỏi này." });
      return;
    }

    res.json({ success: true, message: "Đã đánh dấu câu hỏi đã giải quyết thành công." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Lỗi xử lý câu hỏi." });
  }
});

/**
 * DELETE /api/chatbot/admin/unresolved/:id
 * Xóa câu hỏi khỏi hàng đợi cần bổ sung (Yêu cầu ADMIN trở lên)
 */
router.delete("/api/chatbot/admin/unresolved/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getWebDb();

    const result = await db.run("DELETE FROM chatbot_unresolved WHERE id = ?", id);
    if (result.changes === 0) {
      res.status(404).json({ success: false, error: "Không tìm thấy bản ghi." });
      return;
    }

    res.json({ success: true, message: "Đã xóa câu hỏi khỏi hàng đợi." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Lỗi xóa câu hỏi." });
  }
});

export default router;
