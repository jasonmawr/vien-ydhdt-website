/**
 * @file chatbot.service.ts
 * @description Dịch vụ AI Chatbot sử dụng Google Gemini API.
 * Multi-model fallback + exponential backoff retry để đảm bảo tỷ lệ thành công cao.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
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
const SESSION_TTL = 30 * 60 * 1000; // 30 phút
const MAX_HISTORY = 10; // Giảm từ 20 → 10 để tiết kiệm token
const FALLBACK_MODELS = [
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 3000; // 3s, 6s, 12s

// ─── Session Store ─────────────────────────────────────
const sessions = new Map<string, ChatMessage[]>();

// Dọn session hết hạn mỗi 10 phút
setInterval(() => {
  const now = Date.now();
  for (const [id, messages] of sessions) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && now - lastMsg.timestamp > SESSION_TTL) {
      sessions.delete(id);
    }
  }
}, 10 * 60 * 1000);

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

// Cache system prompt (không cần build lại mỗi lần)
let cachedSystemPrompt: string | null = null;
function getSystemPrompt(): string {
  if (!cachedSystemPrompt) {
    cachedSystemPrompt = buildSystemPrompt();
  }
  return cachedSystemPrompt;
}

// ─── Helpers ───────────────────────────────────────────
function generateSessionId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(msg: string): boolean {
  return msg.includes("429") || msg.includes("quota") || msg.includes("Too Many") || msg.includes("high demand") || msg.includes("503");
}

// ─── Gemini API Call (single model) ────────────────────
async function callModel(modelName: string, history: ChatMessage[], message: string): Promise<string> {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.7,
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
      { role: "user", parts: [{ text: getSystemPrompt() }] },
      { role: "model", parts: [{ text: "Tôi hiểu. Tôi là Y Dược AI, trợ lý ảo của Viện Y Dược Học Dân Tộc TP.HCM." }] },
      ...recentHistory,
    ],
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
}

// ─── Robust Gemini Call (multi-model + retry) ──────────
async function callGeminiRobust(history: ChatMessage[], message: string): Promise<string> {
  let lastError: Error | null = null;

  for (const modelName of FALLBACK_MODELS) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const reply = await callModel(modelName, history, message);
        if (attempt > 0 || modelName !== FALLBACK_MODELS[0]) {
          console.log(`[Chatbot] ✅ Thành công với ${modelName} (attempt ${attempt + 1})`);
        }
        return reply;
      } catch (error: any) {
        lastError = error;
        const errMsg = error.message || "";

        if (isRateLimitError(errMsg)) {
          // Rate limit → đợi rồi retry
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          console.log(`[Chatbot] ⏳ ${modelName} rate limited, retry ${attempt + 1}/${MAX_RETRIES} in ${delay / 1000}s...`);
          await sleep(delay);
          continue;
        }

        // Lỗi khác (404, permission...) → chuyển model
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

// ─── Main Entry Point ──────────────────────────────────
export async function processMessage(req: ChatRequest): Promise<ChatResponse> {
  const sessionId = req.sessionId || generateSessionId();
  let history = sessions.get(sessionId) || [];

  // Thêm tin nhắn người dùng
  history.push({
    role: "user",
    content: req.message,
    timestamp: Date.now(),
  });

  // Giới hạn history
  if (history.length > MAX_HISTORY) {
    history = history.slice(-MAX_HISTORY);
  }

  let reply: string;

  try {
    reply = await callGeminiRobust(history, req.message);
  } catch (error: any) {
    console.error("[Chatbot] ❌ All models exhausted:", error.message?.substring(0, 150));

    if (error.message?.includes("GEMINI_API_KEY")) {
      reply = "⚠️ Trợ lý AI đang được cấu hình. Vui lòng liên hệ **(028) 3844 2349** để được tư vấn trực tiếp.";
    } else {
      reply = "⏳ Hệ thống AI đang bận, vui lòng thử lại sau vài giây nhé! Hoặc gọi **(028) 3844 2349** để được hỗ trợ ngay.";
    }
  }

  // Lưu phản hồi
  history.push({
    role: "assistant",
    content: reply,
    timestamp: Date.now(),
  });

  sessions.set(sessionId, history);

  return {
    reply,
    sessionId,
    suggestedQuestions: getSuggestedQuestions(reply, req.message),
  };
}

/**
 * Lấy lịch sử chat theo session
 */
export function getSessionHistory(sessionId: string): ChatMessage[] {
  return sessions.get(sessionId) || [];
}
