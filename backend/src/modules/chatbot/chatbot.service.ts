/**
 * @file chatbot.service.ts
 * @description Dịch vụ AI Chatbot sử dụng Google Gemini API.
 * Tích hợp RAG: Lấy kiến thức bệnh viện + dữ liệu HIS để trả lời câu hỏi.
 */
import { GoogleGenerativeAI, type GenerateContentResult } from "@google/generative-ai";
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

// In-memory session store (production nên dùng Redis)
const sessions = new Map<string, ChatMessage[]>();
const SESSION_TTL = 30 * 60 * 1000; // 30 phút
const MAX_HISTORY = 20; // Giữ tối đa 20 tin nhắn

// Dọn dẹp session hết hạn mỗi 10 phút
setInterval(() => {
  const now = Date.now();
  for (const [id, messages] of sessions) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && now - lastMsg.timestamp > SESSION_TTL) {
      sessions.delete(id);
    }
  }
}, 10 * 60 * 1000);

/**
 * Khởi tạo Gemini client (lazy)
 */
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

/**
 * Sinh ID session ngẫu nhiên
 */
function generateSessionId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Gợi ý câu hỏi dựa trên nội dung cuộc trò chuyện
 */
function getSuggestedQuestions(reply: string, userMessage: string): string[] {
  const suggestions: string[] = [];
  const lower = (userMessage + " " + reply).toLowerCase();

  if (lower.includes("giờ") || lower.includes("thời gian")) {
    suggestions.push("Cách đặt lịch khám online?");
    suggestions.push("Giá khám bệnh bao nhiêu?");
  } else if (lower.includes("giá") || lower.includes("phí") || lower.includes("chi phí")) {
    suggestions.push("Viện có nhận BHYT không?");
    suggestions.push("Tôi muốn đặt lịch khám");
  } else if (lower.includes("đặt lịch") || lower.includes("đặt khám")) {
    suggestions.push("Thanh toán bằng cách nào?");
    suggestions.push("Viện có những khoa nào?");
  } else if (lower.includes("bhyt") || lower.includes("bảo hiểm")) {
    suggestions.push("Giá khám dịch vụ bao nhiêu?");
    suggestions.push("Cần mang gì khi đến khám?");
  } else {
    suggestions.push("Viện có những dịch vụ gì?");
    suggestions.push("Cách đặt lịch khám online?");
    suggestions.push("Giờ làm việc của Viện?");
  }

  return suggestions.slice(0, 3);
}

/**
 * Xử lý tin nhắn từ người dùng, gọi Gemini API
 */
export async function processMessage(req: ChatRequest): Promise<ChatResponse> {
  const sessionId = req.sessionId || generateSessionId();

  // Lấy hoặc tạo session
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
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    // Build conversation for Gemini
    const systemPrompt = buildSystemPrompt();

    const chatHistory = history.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "Hệ thống: " + systemPrompt }] },
        { role: "model", parts: [{ text: "Tôi đã hiểu. Tôi là Y Dược AI, trợ lý ảo của Viện Y Dược Học Dân Tộc TP.HCM. Tôi sẵn sàng hỗ trợ bệnh nhân." }] },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessage(req.message);
    reply = result.response.text();
  } catch (error: any) {
    console.error("[Chatbot] Gemini API error:", error.message);

    // Fallback khi API lỗi
    if (error.message?.includes("GEMINI_API_KEY")) {
      reply = "⚠️ Trợ lý AI đang được cấu hình. Vui lòng liên hệ **(028) 3844 2349** để được tư vấn trực tiếp.";
    } else {
      reply = "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ **(028) 3844 2349** để được hỗ trợ.";
    }
  }

  // Lưu phản hồi vào history
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
