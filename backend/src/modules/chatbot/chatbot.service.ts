/**
 * @file chatbot.service.ts
 * @description Dịch vụ AI Chatbot sử dụng Google Gemini API với CSDL SQLite CMS động.
 * Hỗ trợ cấu hình Prompt, Welcome message, Mô hình AI động, lưu trữ lịch sử chat bền vững và RAG.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getWebDb } from "../../shared/sqlite";
import { buildSystemPrompt } from "./knowledge-base";

// Types
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
  suggestedQuestions?: string[];
}

// ─── Config ────────────────────────────────────────────
const FALLBACK_MODELS = [
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 3000; // 3s, 6s, 12s

// ─── Gemini Client ─────────────────────────────────────
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY chưa được cấu hình trong .env");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// ─── Dynamic Config & Prompt Helpers ───────────────────
export async function getChatbotConfig(key: string, defaultValue: string): Promise<string> {
  try {
    const db = await getWebDb();
    const row = await db.get("SELECT value FROM chatbot_configs WHERE key = ?", key);
    return row ? row.value : defaultValue;
  } catch (err) {
    return defaultValue;
  }
}

export async function getDynamicSystemPrompt(): Promise<string> {
  try {
    const db = await getWebDb();
    const configRow = await db.get("SELECT value FROM chatbot_configs WHERE key = ?", "system_prompt");
    const basePrompt = configRow ? configRow.value : buildSystemPrompt();

    // Lấy thêm tri thức từ kho tri thức động (Active Knowledge)
    const knowledgeRows = await db.all(
      "SELECT title, content FROM chatbot_knowledge WHERE is_active = 1"
    );

    // Lấy thêm lịch khám bác sĩ đang hoạt động (Active Schedules)
    const scheduleRows = await db.all(
      "SELECT title, content FROM chatbot_schedules WHERE is_active = 1"
    );

    let extraContext = "";

    if (knowledgeRows && knowledgeRows.length > 0) {
      const knowledgeText = knowledgeRows
        .map((k) => `### ${k.title}\n${k.content}`)
        .join("\n\n");
      extraContext += `\n\nKIẾN THỨC BỔ SUNG (RAG):\nSử dụng các thông tin chính thức sau đây từ Viện để trả lời nếu người dùng hỏi liên quan:\n${knowledgeText}`;
    }

    if (scheduleRows && scheduleRows.length > 0) {
      const scheduleText = scheduleRows
        .map((s) => `### ${s.title}\n${s.content}`)
        .join("\n\n");
      extraContext += `\n\nLỊCH KHÁM BÁC SĨ (RAG):\nSử dụng lịch khám chính thức dưới đây để trả lời chính xác khi bệnh nhân hỏi về lịch trực hay ngày khám của bác sĩ cụ thể:\n${scheduleText}`;
    }

    return `${basePrompt}${extraContext}`;
  } catch (err) {
    console.error("[Chatbot] Lỗi xây dựng dynamic system prompt:", err);
    return buildSystemPrompt();
  }
}

// ─── Helpers ───────────────────────────────────────────
function generateSessionId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(msg: string): boolean {
  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("Too Many") ||
    msg.includes("high demand") ||
    msg.includes("503")
  );
}

// ─── Gemini API Call (single model) ────────────────────
async function callModel(
  modelName: string,
  history: ChatMessage[],
  message: string,
  systemPrompt: string
): Promise<string> {
  const ai = getGenAI();
  const temperatureStr = await getChatbotConfig("temperature", "0.7");
  const temperature = parseFloat(temperatureStr) || 0.7;

  const model = ai.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 800,
    },
  });

  // Chỉ giữ 4 tin nhắn gần nhất để giảm token
  const recentHistory = history.slice(-5, -1).map((msg) => ({
    role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: systemPrompt }] },
      {
        role: "model",
        parts: [{ text: "Tôi hiểu. Tôi là Y Dược AI, trợ lý ảo của Viện Y Dược Học Dân Tộc TP.HCM." }],
      },
      ...recentHistory,
    ],
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
}

// ─── Robust Gemini Call (multi-model + retry) ──────────
async function callGeminiRobust(
  history: ChatMessage[],
  message: string,
  systemPrompt: string,
  preferredModel: string
): Promise<string> {
  let lastError: Error | null = null;

  // Ưu tiên preferredModel lên hàng đầu
  const models = [preferredModel, ...FALLBACK_MODELS.filter((m) => m !== preferredModel)];

  for (const modelName of models) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const reply = await callModel(modelName, history, message, systemPrompt);
        if (attempt > 0 || modelName !== preferredModel) {
          console.log(`[Chatbot] ✅ Thành công với ${modelName} (attempt ${attempt + 1})`);
        }
        return reply;
      } catch (error: any) {
        lastError = error;
        const errMsg = error.message || "";

        if (isRateLimitError(errMsg)) {
          // Rate limit → đợi rồi retry
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          console.log(
            `[Chatbot] ⏳ ${modelName} rate limited, retry ${attempt + 1}/${MAX_RETRIES} in ${delay / 1000}s...`
          );
          await sleep(delay);
          continue;
        }

        // Lỗi khác → chuyển sang model tiếp theo
        console.log(`[Chatbot] ❌ ${modelName} failed: ${errMsg.substring(0, 100)}`);
        break;
      }
    }
  }

  // Tất cả model đều fail → throw để processMessage xử lý
  throw lastError || new Error("All models failed");
}

// ─── Suggested Questions ───────────────────────────────
function getSuggestedQuestions(reply: string, userMessage: string): string[] {
  const lower = (userMessage + " " + reply).toLowerCase();

  if (lower.includes("giờ") || lower.includes("thời gian")) {
    return ["Cách đặt lịch khám online?", "Giá khám bệnh bao nhiêu?"];
  }
  if (lower.includes("giá") || lower.includes("phí") || lower.includes("chi phí")) {
    return ["Viện có nhận BHYT không?", "Tôi muốn đặt lịch khám"];
  }
  if (lower.includes("đặt lịch") || lower.includes("đặt khám")) {
    return ["Thanh toán bằng cách nào?", "Viện có những khoa nào?"];
  }
  if (lower.includes("bhyt") || lower.includes("bảo hiểm")) {
    return ["Giá khám dịch vụ bao nhiêu?", "Cần mang gì khi đến khám?"];
  }
  return ["Viện có những dịch vụ gì?", "Cách đặt lịch khám online?", "Giờ làm việc của Viện?"];
}

// ─── Session History DB Helpers ────────────────────────
export async function getSessionHistoryFromDb(sessionId: string): Promise<ChatMessage[]> {
  try {
    const db = await getWebDb();
    const rows = await db.all(
      "SELECT role, content, timestamp FROM chatbot_messages WHERE session_id = ? ORDER BY id ASC",
      sessionId
    );
    return rows.map((r) => ({
      role: r.role as "user" | "assistant",
      content: r.content,
      timestamp: r.timestamp,
    }));
  } catch (err) {
    console.error("[Chatbot] Lỗi load history từ DB:", err);
    return [];
  }
}

// ─── Main Entry Point ──────────────────────────────────
export async function processMessage(
  req: ChatRequest,
  ipAddress?: string,
  userAgent?: string
): Promise<ChatResponse> {
  const sessionId = req.sessionId || generateSessionId();
  const db = await getWebDb();

  // 1. Tạo hoặc kiểm tra hội thoại trong DB
  const conv = await db.get(
    "SELECT session_id FROM chatbot_conversations WHERE session_id = ?",
    sessionId
  );
  if (!conv) {
    await db.run(
      "INSERT INTO chatbot_conversations (session_id, ip_address, user_agent) VALUES (?, ?, ?)",
      sessionId,
      ipAddress || null,
      userAgent || null
    );
  } else {
    await db.run(
      "UPDATE chatbot_conversations SET updated_at = CURRENT_TIMESTAMP WHERE session_id = ?",
      sessionId
    );
  }

  // 2. Lấy lịch sử hội thoại hiện tại
  let history = await getSessionHistoryFromDb(sessionId);

  // 3. Thêm tin nhắn của User vào DB
  const userMsgTime = Date.now();
  await db.run(
    "INSERT INTO chatbot_messages (session_id, role, content, timestamp) VALUES (?, 'user', ?, ?)",
    sessionId,
    req.message,
    userMsgTime
  );

  // Ghi nhận tin nhắn mới vào history local cho context của AI
  history.push({
    role: "user",
    content: req.message,
    timestamp: userMsgTime,
  });

  // 4. Giải quyết Cấu hình AI Persona và Prompt động
  const systemPrompt = await getDynamicSystemPrompt();
  const preferredModel = await getChatbotConfig("ai_model", "gemini-2.0-flash");

  let reply: string;

  try {
    // 5. Gọi Gemini robust
    reply = await callGeminiRobust(history, req.message, systemPrompt, preferredModel);
  } catch (error: any) {
    console.error("[Chatbot] ❌ All models exhausted:", error.message?.substring(0, 150));

    if (error.message?.includes("GEMINI_API_KEY")) {
      reply = "⚠️ Trợ lý AI đang được cấu hình. Vui lòng liên hệ **(028) 3844 2349** để được tư vấn trực tiếp.";
    } else {
      reply = "⏳ Hệ thống AI đang bận, vui lòng thử lại sau vài giây nhé! Hoặc gọi **(028) 3844 2349** để được hỗ trợ ngay.";
    }
  }

  // 6. Lưu phản hồi của Assistant vào DB
  const assistantMsgTime = Date.now();
  await db.run(
    "INSERT INTO chatbot_messages (session_id, role, content, timestamp) VALUES (?, 'assistant', ?, ?)",
    sessionId,
    reply,
    assistantMsgTime
  );

  // 7. Tự động ghi nhận câu hỏi chưa khớp (unresolved) nếu bot trả lời bằng số hotline hoặc fallback
  const replyLower = reply.toLowerCase();
  if (
    replyLower.includes("(028) 3844 2349") ||
    replyLower.includes("bận") ||
    replyLower.includes("thử lại sau") ||
    replyLower.includes("không biết") ||
    replyLower.includes("chưa có thông tin")
  ) {
    try {
      // Tránh trùng lặp câu hỏi chưa khớp trong hàng đợi
      const existing = await db.get(
        "SELECT id FROM chatbot_unresolved WHERE question = ? AND is_resolved = 0",
        req.message.trim()
      );
      if (!existing) {
        await db.run(
          "INSERT INTO chatbot_unresolved (question, match_score, is_resolved) VALUES (?, 0, 0)",
          req.message.trim()
        );
        console.log(`[Unresolved Logs] Đã tự động ghi nhận câu hỏi cần bổ sung: "${req.message}"`);
      }
    } catch (errUnresolved) {
      console.error("[Unresolved Logs] Lỗi ghi nhận câu hỏi cần bổ sung:", errUnresolved);
    }
  }

  return {
    reply,
    sessionId,
    suggestedQuestions: getSuggestedQuestions(reply, req.message),
  };
}

/**
 * Lấy lịch sử chat theo session
 */
export async function getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
  return getSessionHistoryFromDb(sessionId);
}
