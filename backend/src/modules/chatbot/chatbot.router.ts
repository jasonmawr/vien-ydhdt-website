/**
 * @file chatbot.router.ts
 * @description Express Router cho module AI Chatbot
 * Base path: /api/chatbot
 */
import { Router, type Request, type Response } from "express";
import { processMessage, getSessionHistory } from "./chatbot.service";

const router = Router();

/**
 * POST /api/chatbot/message
 * Body: { message: string, sessionId?: string }
 * Returns: { success, reply, sessionId, suggestedQuestions }
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

    // Giới hạn độ dài tin nhắn
    if (message.length > 1000) {
      res.status(400).json({
        success: false,
        error: "Tin nhắn quá dài. Vui lòng giới hạn dưới 1000 ký tự.",
      });
      return;
    }

    const result = await processMessage({
      message: message.trim(),
      sessionId,
    });

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
      error: "Lỗi xử lý tin nhắn.",
    });
  }
});

/**
 * GET /api/chatbot/history?sessionId=xxx
 * Lấy lịch sử hội thoại
 */
router.get("/history", (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    res.status(400).json({ success: false, error: "Thiếu sessionId" });
    return;
  }

  const history = getSessionHistory(sessionId);
  res.json({ success: true, data: history });
});

/**
 * GET /api/chatbot/health
 * Kiểm tra trạng thái chatbot
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

export default router;
