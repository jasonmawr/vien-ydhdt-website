"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Bot, User, Sparkles, ChevronDown } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  sessionId: string | null;
  suggestedQuestions: string[];
  isLoading: boolean;
}

const INITIAL_SUGGESTIONS = [
  "Giờ làm việc của Viện?",
  "Cách đặt lịch khám online?",
  "Viện có nhận BHYT không?",
];

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Xin chào! 👋 Tôi là **Y Dược AI** — trợ lý ảo của Viện Y Dược Học Dân Tộc TP.HCM.\n\nTôi có thể giúp bạn:\n- 📋 Thông tin dịch vụ & giá khám\n- 🕐 Giờ làm việc & địa chỉ\n- 📅 Hướng dẫn đặt lịch khám\n- 💊 Giới thiệu chuyên khoa\n\nBạn cần hỗ trợ gì ạ?",
  timestamp: Date.now(),
};

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [state, setState] = useState<ChatState>({
    messages: [WELCOME_MESSAGE],
    sessionId: null,
    suggestedQuestions: INITIAL_SUGGESTIONS,
    isLoading: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.isLoading]);

  // Focus input khi mở chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Check scroll position
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShowScrollDown(!isNearBottom);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || state.isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      suggestedQuestions: [],
    }));
    setInput("");

    try {
      const res = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          sessionId: state.sessionId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const aiMessage: ChatMessage = {
          role: "assistant",
          content: data.reply,
          timestamp: Date.now(),
        };

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
          sessionId: data.sessionId,
          suggestedQuestions: data.suggestedQuestions || [],
          isLoading: false,
        }));
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại hoặc gọi **(028) 3844 2349** để được hỗ trợ.",
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
        suggestedQuestions: INITIAL_SUGGESTIONS,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (q: string) => {
    sendMessage(q);
  };

  // Render markdown-lite (bold, lists)
  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Bold
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (processed.startsWith("- ")) {
        processed = `<span class="inline-block ml-2">${processed.substring(2)}</span>`;
        return <div key={i} className="flex items-start gap-1 my-0.5"><span className="text-primary-500 mt-0.5">•</span><span dangerouslySetInnerHTML={{ __html: processed }} /></div>;
      }
      if (processed.trim() === "") return <br key={i} />;
      return <p key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: processed }} />;
    });
  };

  // Ẩn chatbot trên trang admin
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group ${
          isOpen
            ? "bg-stone-700 hover:bg-stone-800 scale-90"
            : "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 scale-100 hover:scale-110"
        }`}
        aria-label={isOpen ? "Đóng chatbot" : "Mở chatbot Y Dược AI"}
      >
        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <>
            <MessageCircle size={24} className="text-white" />
            {/* Pulse animation */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          </>
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] transition-all duration-300 origin-bottom-right ${
          isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col" style={{ height: "520px" }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm">Y Dược AI</h3>
              <p className="text-emerald-100 text-xs">Trợ lý ảo Viện Y Dược Học Dân Tộc</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              <span className="text-emerald-100 text-xs">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-stone-50/50 scroll-smooth"
            style={{ scrollbarWidth: "thin" }}
          >
            {state.messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-md"
                      : "bg-white text-stone-700 border border-stone-200 rounded-bl-md shadow-sm"
                  }`}
                >
                  {renderContent(msg.content)}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={14} className="text-stone-500" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {state.isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white text-stone-700 border border-stone-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll down indicator */}
          {showScrollDown && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-[130px] left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full p-1.5 border border-stone-200 z-10 hover:bg-stone-50 transition-colors"
            >
              <ChevronDown size={16} className="text-stone-500" />
            </button>
          )}

          {/* Suggested Questions */}
          {state.suggestedQuestions.length > 0 && !state.isLoading && (
            <div className="px-4 py-2 border-t border-stone-100 bg-white flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {state.suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(q)}
                  className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex-shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-stone-200 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={state.isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={state.isLoading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-stone-400 mt-1.5 text-center">
              Y Dược AI — Trợ lý ảo, không thay thế bác sĩ
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
