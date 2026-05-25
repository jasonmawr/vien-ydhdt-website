"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Settings, BookOpen, MessageSquare, BarChart3, 
  ThumbsUp, ThumbsDown, RefreshCw, Plus, Trash2, Edit2, 
  Database, AlertCircle, Save, Send, ShieldAlert, Cpu, CheckCircle,
  Users, Zap, Calendar, HelpCircle, Check, MessageCircle, X, Shield, Globe, MapPin, Phone, Clock
} from "lucide-react";
import { getAuthToken } from "@/services/auth";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend
} from "recharts";

const API = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

// Interfaces
interface KnowledgeItem {
  id: string;
  source_type: "faq" | "document" | "cms_post" | "url";
  source_reference: string | null;
  title: string;
  content: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  content: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface UnresolvedQuestion {
  id: number;
  question: string;
  match_score: number;
  is_resolved: number;
  created_at: string;
}

interface Conversation {
  session_id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  rating: number | null;
  feedback_notes: string | null;
  message_count: number;
  first_message: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface Analytics {
  summary: {
    totalChats: number;
    totalMessages: number;
    likes: number;
    dislikes: number;
    unresolvedCount: number;
    knowledgeCount: number;
  };
  dailyInteractions: Array<{ date: string; user_msg: number; bot_msg: number }>;
  popularKeywords: Array<{ name: string; value: number }>;
}

export default function ChatbotPortalPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "overview" | "knowledge" | "schedule" | "history" | "unresolved" | "config">("chat");
  
  // Auth & Token state
  const tokenRef = useRef<string>("");
  const [isGuest, setIsGuest] = useState(false);

  // Common Loading & Messages State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Tab 1: Chat Simulator State
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý ảo Y Dược AI của Viện Y dược học Dân tộc Thành phố Hồ Chí Minh.\nTôi có thể giúp gì cho bạn hôm nay?",
      timestamp: Date.now()
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "Giờ làm việc của Viện?",
    "Đặt lịch khám Đông y",
    "Châm cứu có đau không?",
    "Quyền lợi khám BHYT"
  ]);

  // Tab 2: Analytics / Overview State
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // Tab 3: Knowledge State
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [searchKnowledge, setSearchKnowledge] = useState("");
  const [filterKnowledgeType, setFilterKnowledgeType] = useState<string>("");
  const [showAddKbModal, setShowAddKbModal] = useState(false);
  const [editingKbItem, setEditingKbItem] = useState<KnowledgeItem | null>(null);
  const [kbForm, setKbForm] = useState({
    source_type: "faq" as "faq" | "url",
    title: "",
    content: "",
    is_active: true
  });

  // Tab 4: Schedule State (Lịch khám)
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [editingScheduleItem, setEditingScheduleItem] = useState<ScheduleItem | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    content: "",
    is_active: true
  });

  // Tab 5: Unresolved State (Cần bổ sung)
  const [unresolved, setUnresolved] = useState<UnresolvedQuestion[]>([]);

  // Tab 6: Conversations History State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<{
    conversation: Conversation;
    messages: Message[];
  } | null>(null);
  const [filterSessionRating, setFilterSessionRating] = useState<string>("");
  const [loadingSessionDetails, setLoadingSessionDetails] = useState(false);

  // Tab 7: Hospital Configurations (Cài đặt)
  const [hospitalConfigs, setHospitalConfigs] = useState({
    hospital_name: "Viện Y dược học Dân tộc Thành phố Hồ Chí Minh",
    hospital_address_1: "179-187 Nam Kỳ Khởi Nghĩa, P. Võ Thị Sáu, Q.3, TP.HCM",
    hospital_address_2: "218K Trần Hưng Đạo B, P. Chợ Lớn, TP.HCM",
    hospital_phone: "(028) 3932 6579 - (028) 3932 6004",
    hospital_hours: "T2-T7: 7h00-11h30 13h00-16h30",
    hospital_website: "yhct.vn",
    system_prompt: "",
    welcome_message: "",
    ai_model: "gemini-2.0-flash",
    temperature: "0.7",
    widget_theme_color: "#109173"
  });

  // Toast Helper
  const showToast = (msg: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  // Check URL token & localStorage for bypass authentication
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    if (urlToken) {
      localStorage.setItem("guest_chatbot_token", urlToken);
      tokenRef.current = urlToken;
      setIsGuest(true);
      
      // Clean query parameter from address bar
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else {
      const savedToken = localStorage.getItem("guest_chatbot_token");
      if (savedToken) {
        tokenRef.current = savedToken;
        setIsGuest(true);
      } else {
        // Fallback to Next.js cookie auth token
        getAuthToken().then(t => {
          tokenRef.current = t || "";
          setIsGuest(false);
        });
      }
    }
  }, []);

  // Fetch helper incorporating Guest token or Auth cookie token
  const apiFetch = useCallback(async (path: string, options: RequestInit = {}) => {
    if (!tokenRef.current) {
      // Lazy load
      const savedToken = localStorage.getItem("guest_chatbot_token");
      if (savedToken) {
        tokenRef.current = savedToken;
      } else {
        tokenRef.current = await getAuthToken() || "";
      }
    }
    const headers = {
      "Authorization": `Bearer ${tokenRef.current}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
    return fetch(`${API}${path}`, { ...options, headers });
  }, []);

  // ─── TAB 1: INTERACTIVE CHAT SIMULATOR ──────────────────
  const triggerSimMessage = async (text: string) => {
    if (!text.trim() || chatLoading) return;
    
    const userMsg: Message = {
      role: "user",
      content: text.trim(),
      timestamp: Date.now()
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`${API}/api/chatbot/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          sessionId: currentSessionId
        })
      });

      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, {
          role: "assistant",
          content: data.reply,
          timestamp: Date.now()
        }]);
        if (data.sessionId) setCurrentSessionId(data.sessionId);
        if (data.suggestedQuestions) setSuggestedQuestions(data.suggestedQuestions);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠️ Hệ thống AI đang bận. Vui lòng kết nối máy chủ hoặc kiểm tra API Key.",
        timestamp: Date.now()
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChatSession = () => {
    setChatMessages([
      {
        role: "assistant",
        content: "Xin chào! Tôi là trợ lý ảo Y Dược AI của Viện Y dược học Dân tộc Thành phố Hồ Chí Minh.\nTôi có thể giúp gì cho bạn hôm nay?",
        timestamp: Date.now()
      }
    ]);
    setCurrentSessionId(null);
    setSuggestedQuestions(["Giờ làm việc của Viện?", "Đặt lịch khám Đông y", "Châm cứu có đau không?", "Quyền lợi khám BHYT"]);
    showToast("Đã làm mới cuộc trò chuyện thử nghiệm.");
  };

  // ─── TAB 2: OVERVIEW & ANALYTICS ────────────────────
  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/chatbot/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setAnalytics(json.data || json);
      } else {
        setErrorMessage("Lỗi tải dữ liệu báo cáo phân tích.");
      }
    } catch (err) {
      setErrorMessage("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  // ─── TAB 3: KNOWLEDGE FAQ & CMS RAG ───────────────────
  const loadKnowledge = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/chatbot/admin/knowledge";
      const params = [];
      if (searchKnowledge) params.push(`search=${encodeURIComponent(searchKnowledge)}`);
      if (filterKnowledgeType) params.push(`type=${filterKnowledgeType}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const res = await apiFetch(url);
      if (res.ok) {
        const json = await res.json();
        setKnowledge(json.data || []);
      } else {
        setErrorMessage("Lỗi tải cơ sở tri thức.");
      }
    } catch (err) {
      setErrorMessage("Lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch, searchKnowledge, filterKnowledgeType]);

  const saveKnowledgeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingKbItem ? "PUT" : "POST";
      const path = editingKbItem 
        ? `/api/chatbot/admin/knowledge/${editingKbItem.id}`
        : "/api/chatbot/admin/knowledge";
        
      const res = await apiFetch(path, {
        method,
        body: JSON.stringify(kbForm)
      });
      
      if (res.ok) {
        showToast(editingKbItem ? "Cập nhật tri thức thành công!" : "Thêm tri thức mới thành công!");
        setShowAddKbModal(false);
        setEditingKbItem(null);
        setKbForm({ source_type: "faq", title: "", content: "", is_active: true });
        loadKnowledge();
      } else {
        showToast("Lỗi xử lý cơ sở tri thức.", false);
      }
    } catch (err) {
      showToast("Lỗi kết nối.", false);
    } finally {
      setLoading(false);
    }
  };

  const deleteKnowledgeItem = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tri thức này khỏi cơ sở dữ liệu?")) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/chatbot/admin/knowledge/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Đã xóa tri thức thành công.");
        loadKnowledge();
      } else {
        showToast("Không thể xóa tri thức.", false);
      }
    } catch (err) {
      showToast("Lỗi kết nối.", false);
    } finally {
      setLoading(false);
    }
  };

  const toggleKnowledgeActive = async (item: KnowledgeItem) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/chatbot/admin/knowledge/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: item.title,
          content: item.content,
          is_active: item.is_active === 1 ? 0 : 1
        })
      });
      if (res.ok) {
        showToast("Đã chuyển đổi trạng thái áp dụng!");
        loadKnowledge();
      }
    } catch (err) {
      showToast("Lỗi kết nối.", false);
    } finally {
      setLoading(false);
    }
  };

  const triggerCmsSync = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/chatbot/admin/knowledge/sync-cms", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        showToast(json.message || "Đồng bộ hóa thành công bài viết CMS!");
        loadKnowledge();
      } else {
        showToast("Lỗi đồng bộ hóa dữ liệu từ CMS.", false);
      }
    } catch (err) {
      showToast("Lỗi kết nối.", false);
    } finally {
      setLoading(false);
    }
  };

  // ─── TAB 4: SCHEDULE CLINIC ─────────────────────────
  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/chatbot/admin/schedules");
      if (res.ok) {
        const json = await res.json();
        setSchedules(json.data || []);
      } else {
        setErrorMessage("Lỗi tải lịch khám bác sĩ.");
      }
    } catch (err) {
      setErrorMessage("Không thể kết nối.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  const saveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingScheduleItem ? "PUT" : "POST";
      const path = editingScheduleItem 
        ? `/api/chatbot/admin/schedules/${editingScheduleItem.id}`
        : "/api/chatbot/admin/schedules";

      const res = await apiFetch(path, {
        method,
        body: JSON.stringify(scheduleForm)
      });

      if (res.ok) {
        showToast(editingScheduleItem ? "Cập nhật lịch khám thành công!" : "Tạo lịch khám mới thành công!");
        setShowAddScheduleModal(false);
        setEditingScheduleItem(null);
        setScheduleForm({ title: "", content: "", is_active: true });
        loadSchedules();
      } else {
        showToast("Lỗi lưu lịch khám.", false);
      }
    } catch (err) {
      showToast("Lỗi kết nối.", false);
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm("Bạn muốn xóa lịch khám bác sĩ này?")) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/chatbot/admin/schedules/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Đã xóa lịch khám thành công.");
        loadSchedules();
      }
    } catch (err) {
      showToast("Lỗi kết nối.", false);
    } finally {
      setLoading(false);
    }
  };

  const toggleScheduleActive = async (item: ScheduleItem) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/chatbot/admin/schedules/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: item.title,
          content: item.content,
          is_active: item.is_active === 1 ? 0 : 1
        })
      });
      if (res.ok) {
        showToast("Đã cập nhật trạng thái lịch trực!");
        loadSchedules();
      }
    } catch (err) {
      showToast("Lỗi kết nối.", false);
    } finally {
      setLoading(false);
    }
  };

  // ─── TAB 5: HISTORY REALTIME LOGS ─────────────────────
  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/chatbot/admin/conversations?limit=50";
      if (filterSessionRating) url += `&rating=${filterSessionRating}`;
      const res = await apiFetch(url);
      if (res.ok) {
        const json = await res.json();
        setConversations(json.data || []);
      } else {
        setErrorMessage("Lỗi tải nhật ký hội thoại.");
      }
    } catch (err) {
      setErrorMessage("Không thể kết nối.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch, filterSessionRating]);

  const loadConversationDetails = useCallback(async (sessionId: string) => {
    setLoadingSessionDetails(true);
    try {
      const res = await apiFetch(`/api/chatbot/admin/conversations/${sessionId}`);
      if (res.ok) {
        const json = await res.json();
        setSelectedConversation(json);
      } else {
        showToast("Lỗi tải cuộc hội thoại.", false);
      }
    } catch (err) {
      showToast("Lỗi kết nối.", false);
    } finally {
      setLoadingSessionDetails(false);
    }
  }, [apiFetch]);

  // ─── TAB 6: UNRESOLVED QUESTIONS ───────────────────
  const loadUnresolved = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/chatbot/admin/unresolved");
      if (res.ok) {
        const json = await res.json();
        setUnresolved(json.data || []);
      } else {
        setErrorMessage("Lỗi tải các câu hỏi chưa giải quyết.");
      }
    } catch (err) {
      setErrorMessage("Lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  const resolveUnresolved = async (item: UnresolvedQuestion) => {
    setEditingKbItem(null);
    setKbForm({
      source_type: "faq",
      title: item.question,
      content: "",
      is_active: true
    });
    try {
      await apiFetch(`/api/chatbot/admin/unresolved/${item.id}/resolve`, { method: "POST" });
      loadUnresolved();
    } catch {}
    setActiveTab("knowledge");
    setShowAddKbModal(true);
  };

  const deleteUnresolved = async (id: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/chatbot/admin/unresolved/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Đã xóa câu hỏi thành công.");
        loadUnresolved();
      }
    } catch (err) {
      showToast("Lỗi kết nối.", false);
    } finally {
      setLoading(false);
    }
  };

  // ─── TAB 7: HOSPITAL CONFIGURATIONS ─────────────────
  const loadHospitalConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/chatbot/admin/config");
      if (res.ok) {
        const json = await res.json();
        const data = json.data || {};
        setHospitalConfigs(prev => ({
          ...prev,
          hospital_name: data.hospital_name || "Viện Y dược học Dân tộc Thành phố Hồ Chí Minh",
          hospital_address_1: data.hospital_address_1 || "179-187 Nam Kỳ Khởi Nghĩa, P. Võ Thị Sáu, Q.3, TP.HCM",
          hospital_address_2: data.hospital_address_2 || "218K Trần Hưng Đạo B, P. Chợ Lớn, TP.HCM",
          hospital_phone: data.hospital_phone || "(028) 3932 6579 - (028) 3932 6004",
          hospital_hours: data.hospital_hours || "T2-T7: 7h00-11h30 13h00-16h30",
          hospital_website: data.hospital_website || "yhct.vn",
          system_prompt: data.system_prompt || "",
          welcome_message: data.welcome_message || "",
          ai_model: data.ai_model || "gemini-2.0-flash",
          temperature: data.temperature || "0.7",
          widget_theme_color: data.widget_theme_color || "#109173"
        }));
      }
    } catch (err) {
      setErrorMessage("Không thể kết nối.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  const saveHospitalConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch("/api/chatbot/admin/config", {
        method: "POST",
        body: JSON.stringify(hospitalConfigs)
      });
      if (res.ok) {
        showToast("Đã cập nhật hệ thống và lưu cấu hình thành công!");
      } else {
        showToast("Lỗi lưu cấu hình.", false);
      }
    } catch (err) {
      showToast("Lỗi kết nối.", false);
    } finally {
      setLoading(false);
    }
  };

  // Auto trigger loading based on Active Tab
  useEffect(() => {
    setErrorMessage(null);
    if (activeTab === "overview") loadAnalytics();
    if (activeTab === "knowledge") loadKnowledge();
    if (activeTab === "schedule") loadSchedules();
    if (activeTab === "history") {
      loadConversations();
      setSelectedSessionId(null);
      setSelectedConversation(null);
    }
    if (activeTab === "unresolved") loadUnresolved();
    if (activeTab === "config") loadHospitalConfigs();
  }, [activeTab, loadAnalytics, loadKnowledge, loadSchedules, loadConversations, loadUnresolved, loadHospitalConfigs]);

  useEffect(() => {
    if (selectedSessionId) {
      loadConversationDetails(selectedSessionId);
    }
  }, [selectedSessionId, loadConversationDetails]);

  // Search Debouncer for Knowledge Base
  useEffect(() => {
    if (activeTab === "knowledge") {
      const delayDebounce = setTimeout(() => {
        loadKnowledge();
      }, 400);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchKnowledge, filterKnowledgeType, activeTab, loadKnowledge]);

  return (
    <div className="flex min-h-screen bg-[#f3f7f5] font-sans antialiased overflow-hidden selection:bg-[#109173]/20">
      
      {/* Dynamic Toast floaters */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 bg-[#109173] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#0d785f] text-xs font-bold"
          >
            <CheckCircle className="w-4 h-4 text-green-300" />
            <span>{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-rose-500 text-xs font-bold"
          >
            <AlertCircle className="w-4 h-4 text-rose-200" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cyber Sidebar navigation panel - fully customized around Viện */}
      <aside className="w-72 bg-white border-r border-stone-200/80 flex flex-col justify-between p-6 shrink-0 relative z-30 shadow-sm">
        <div className="space-y-8">
          
          {/* Logo container without third-party brandings */}
          <div className="flex items-center gap-3 border-b border-stone-100 pb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#109173] to-emerald-600 flex items-center justify-center text-white shadow-md shadow-[#109173]/20 shrink-0">
              <Bot className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="font-extrabold text-stone-850 text-[13px] leading-tight tracking-tight">Y Dược AI</h2>
              <span className="text-[9px] text-[#109173] font-bold uppercase tracking-wider block mt-1 font-mono">Viện Y Dược Học Dân Tộc</span>
            </div>
          </div>

          {/* Links sidebar stack */}
          <nav className="space-y-1 relative">
            {[
              { id: "chat", label: "Kiểm thử Chatbot", Icon: MessageCircle },
              { id: "overview", label: "Thống kê tổng quan", Icon: BarChart3 },
              { id: "knowledge", label: "Cơ sở tri thức", Icon: BookOpen },
              { id: "schedule", label: "Quản lý lịch khám", Icon: Calendar },
              { id: "history", label: "Lịch sử hội thoại", Icon: MessageSquare },
              { id: "unresolved", label: "Câu hỏi chưa khớp", Icon: HelpCircle }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-xs font-bold transition-all relative cursor-pointer hover:scale-[1.01] hover:-translate-y-0.25 duration-200 active:scale-98 ${
                    isActive 
                      ? "text-[#109173]" 
                      : "text-stone-500 hover:bg-stone-50"
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="sidebarActiveIndicator"
                      className="absolute inset-0 bg-[#109173]/8 border-l-3 border-[#109173] rounded-2xl shadow-xs"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <tab.Icon className={`w-4.5 h-4.5 shrink-0 transition-transform ${isActive ? "scale-110 text-[#109173]" : "text-stone-400"}`} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Configuration Link */}
        <div className="border-t border-stone-100 pt-4">
          <button
            onClick={() => setActiveTab("config")}
            className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-xs font-bold transition-all relative cursor-pointer hover:scale-[1.01] hover:-translate-y-0.25 duration-200 active:scale-98 ${
              activeTab === "config" 
                ? "text-[#109173]" 
                : "text-stone-500 hover:bg-stone-50"
            }`}
          >
            {activeTab === "config" && (
              <motion.div 
                layoutId="sidebarActiveIndicator"
                className="absolute inset-0 bg-[#109173]/8 border-l-3 border-[#109173] rounded-2xl shadow-xs"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Settings className={`w-4.5 h-4.5 shrink-0 transition-transform ${activeTab === "config" ? "scale-110 text-[#109173]" : "text-stone-400"}`} />
            <span className="relative z-10">Cấu hình hệ thống</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f4f7f5]">
        
        {/* Top Header Section with beautiful details */}
        <header className="bg-white border-b border-stone-200/80 px-8 py-4.5 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            {isGuest && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-3.5 py-1 rounded-full flex items-center gap-1 border border-amber-200 tracking-wider shadow-sm animate-pulse">
                <Shield className="w-3.5 h-3.5" />
                <span>GIÁM ĐỐC</span>
              </span>
            )}
            <h1 className="text-xs font-extrabold text-stone-700 leading-none tracking-tight">
              {hospitalConfigs.hospital_name}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Pure Vietnamese Selector badge */}
            <div className="bg-emerald-50/50 px-3.5 py-1.5 rounded-xl border border-emerald-100/50 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-extrabold text-[#109173] uppercase tracking-wider">Tiếng Việt (Chuẩn)</span>
            </div>
            
            {activeTab === "chat" && (
              <button 
                onClick={clearChatSession}
                title="Làm mới cuộc chat"
                className="w-9 h-9 rounded-xl border bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer hover:rotate-12 duration-200"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Inner Tab container with spring transitions */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="h-full"
            >
              
              {/* ─── TAB 1: CHAT INTERACTIVE SIMULATOR ────────────────── */}
              {activeTab === "chat" && (
                <div className="flex flex-col h-full max-w-4xl mx-auto justify-between bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-sm relative z-10">
                  
                  {/* Banner Header */}
                  <div className="px-6 py-4.5 border-b border-stone-150 flex items-center justify-between bg-stone-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-xs font-extrabold text-stone-600">Trợ lý AI đang sẵn sàng kiểm thử</span>
                    </div>
                    <span className="text-[10px] text-[#109173] font-black bg-emerald-50 border border-emerald-100/50 px-3.5 py-1 rounded-full uppercase tracking-wider">Mô hình AI: {hospitalConfigs.ai_model}</span>
                  </div>

                  {/* Message scroll log area with spring bubbly entries */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-5 bg-[#fbfcfb]/50">
                    {chatMessages.map((msg, i) => (
                      <motion.div 
                        key={i}
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                          <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wide">
                            {msg.role === "user" ? "Khách kiểm thử" : "Trợ lý Y Dược AI"}
                          </span>
                        </div>
                        <div className={`p-4 rounded-2xl max-w-[80%] text-xs leading-relaxed font-bold shadow-xs whitespace-pre-line ${
                          msg.role === "user"
                            ? "bg-[#109173] text-white rounded-tr-none shadow-md shadow-[#109173]/10"
                            : "bg-white border border-stone-250 text-stone-700 rounded-tl-none"
                        }`}>
                          {msg.content}
                        </div>
                      </motion.div>
                    ))}
                    
                    {chatLoading && (
                      <div className="flex justify-start items-center gap-2 animate-pulse pl-2">
                        <div className="w-6 h-6 bg-[#109173]/10 text-[#109173] rounded-full flex items-center justify-center">
                          <Cpu className="w-3.5 h-3.5 animate-spin" />
                        </div>
                        <span className="text-[10px] text-stone-400 font-extrabold">Trợ lý AI đang phân tích dữ liệu...</span>
                      </div>
                    )}
                  </div>

                  {/* Suggestion Pills stack at the bottom */}
                  <div className="p-6 border-t border-stone-150 bg-white space-y-4 shadow-sm">
                    {suggestedQuestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {suggestedQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => triggerSimMessage(q)}
                            className="bg-[#109173]/5 hover:bg-[#109173]/10 border border-[#109173]/20 hover:border-[#109173]/30 text-[#109173] text-xs px-4 py-2.5 rounded-full font-extrabold transition-all hover:scale-[1.03] active:scale-97 cursor-pointer hover:shadow-sm"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Chat input box */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        triggerSimMessage(chatInput);
                      }}
                      className="flex gap-3"
                    >
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Nhập câu hỏi kiểm thử trợ lý ảo..."
                        disabled={chatLoading}
                        className="flex-1 border border-stone-300 focus:border-[#109173] focus:ring-2 focus:ring-[#109173]/10 bg-stone-50 rounded-2xl px-5 py-3.5 text-xs font-bold outline-none transition-all disabled:opacity-60"
                      />
                      <button 
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className="w-12 h-12 bg-[#109173] hover:bg-[#0c7058] active:scale-95 text-white rounded-2xl flex items-center justify-center shadow-md shadow-[#109173]/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.03]"
                      >
                        <Send className="w-4.5 h-4.5" />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ─── TAB 2: TỔNG QUAN (OVERVIEW) ──────────────────── */}
              {activeTab === "overview" && analytics && (
                <div className="space-y-6">
                  
                  {/* Top Stats Banner */}
                  <div className="bg-gradient-to-r from-[#109173] to-emerald-600 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-extrabold flex items-center gap-2">Hệ thống phân tích hoạt động 📊</h2>
                      <p className="text-xs text-emerald-100 mt-1 font-medium">Tổng hợp hoạt động thời gian thực của AI Chatbot.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl text-xs font-extrabold border border-white/10 shadow-sm">
                      <span className="w-2 h-2 bg-green-300 rounded-full animate-ping" />
                      <span>CMS Động - Thời gian thực</span>
                    </div>
                  </div>

                  {/* 6 metrics Row - Fully Clickable for seamless premium transition */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {[
                      { l: "Khách ghé thăm", v: analytics.summary.totalChats, color: "text-[#109173] bg-emerald-50 border-emerald-100", targetTab: "history" },
                      { l: "Cuộc hội thoại", v: analytics.summary.totalChats, color: "text-[#109173] bg-emerald-50 border-emerald-100", targetTab: "history" },
                      { l: "Số tin nhắn", v: analytics.summary.totalMessages, color: "text-[#109173] bg-emerald-50 border-emerald-100", targetTab: "history" },
                      { l: "Đánh giá tốt", v: `${analytics.summary.likes} 👍`, color: "text-blue-600 bg-blue-50 border-blue-100", targetTab: "history" },
                      { l: "Tổng tri thức", v: analytics.summary.knowledgeCount, color: "text-purple-600 bg-purple-50 border-purple-100", targetTab: "knowledge" },
                      { l: "Cần phản hồi", v: analytics.summary.unresolvedCount, color: "text-rose-600 bg-rose-50 border-rose-100", targetTab: "unresolved" }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveTab(item.targetTab as any);
                          if (item.l === "Đánh giá tốt") {
                            setFilterSessionRating("1");
                          }
                        }}
                        title={`Bấm để chuyển nhanh qua trang ${item.l}`}
                        className="bg-white border rounded-2xl p-5 text-center flex flex-col justify-center items-center shadow-xs border-stone-200/80 hover:scale-[1.03] transition-all duration-300 hover:shadow-md hover:border-[#109173] cursor-pointer"
                      >
                        <span className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider">{item.l}</span>
                        <span className={`text-base font-black mt-2.5 px-3.5 py-1 rounded-full border ${item.color}`}>{item.v}</span>
                      </button>
                    ))}
                  </div>

                  {/* Top FAQ responses and interactive graphs */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Top answers lists */}
                    <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                      <h3 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider">Top các chủ đề được quan tâm</h3>
                      <div className="space-y-3.5">
                        {[
                          { q: "Thời gian làm việc của Viện có khám Thứ Bảy không?", count: 32 },
                          { q: "Châm cứu chữa thoái hóa cột sống cổ và chi phí điều trị?", count: 28 },
                          { q: "Đăng ký khám BHYT trái tuyến cần mang giấy tờ gì?", count: 18 },
                          { q: "Địa chỉ các cơ sở và hotline liên hệ chính thức?", count: 15 }
                        ].map((faq, i) => (
                          <div key={i} className="flex items-center justify-between p-3.5 border rounded-xl hover:border-[#109173] transition-all duration-300 hover:scale-[1.01] bg-stone-50/20">
                            <span className="text-xs text-stone-700 font-bold truncate max-w-[280px]">{faq.q}</span>
                            <span className="bg-[#109173]/10 text-[#109173] text-[10px] font-extrabold px-3 py-1 rounded-full">{faq.count} lượt</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Analytics trend line chart */}
                    <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                      <h3 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider mb-4">Biểu đồ Tương tác của người bệnh</h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analytics.dailyInteractions}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#888" fontSize={9} tickLine={false} />
                            <YAxis stroke="#888" fontSize={9} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Legend />
                            <Line name="Người bệnh hỏi" type="monotone" dataKey="user_msg" stroke="#109173" strokeWidth={2.5} activeDot={{ r: 5 }} />
                            <Line name="Y Dược AI trả lời" type="monotone" dataKey="bot_msg" stroke="#3b82f6" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ─── TAB 3: KIẾN THỨC (KNOWLEDGE RAG) ──────────────── */}
              {activeTab === "knowledge" && (
                <div className="space-y-6">
                  
                  {/* Search and sync control toolbar with customized premium elements */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white border border-stone-200/80 p-4.5 rounded-2xl shadow-xs">
                    <div className="flex gap-3 flex-1 w-full relative">
                      <input 
                        type="text"
                        placeholder="Tìm kiếm tri thức..."
                        value={searchKnowledge}
                        onChange={(e) => setSearchKnowledge(e.target.value)}
                        className="bg-stone-50 border border-stone-250 focus:border-[#109173] focus:ring-2 focus:ring-[#109173]/10 rounded-xl px-4 py-2.5 text-xs font-bold outline-none w-full sm:max-w-xs transition-all"
                      />
                      
                      {/* Premium Custom dropdown arrow layout */}
                      <div className="relative w-full sm:max-w-[180px]">
                        <select
                          value={filterKnowledgeType}
                          onChange={(e) => setFilterKnowledgeType(e.target.value)}
                          className="w-full bg-white border border-stone-250 hover:border-stone-300 rounded-xl px-4 py-2.5 text-xs font-extrabold text-stone-600 shadow-sm outline-none transition-all focus:border-[#109173] focus:ring-2 focus:ring-[#109173]/10 cursor-pointer appearance-none pr-9 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.6rem_center] bg-no-repeat"
                        >
                          <option value="">Tất cả tri thức</option>
                          <option value="faq">Q&A thủ công</option>
                          <option value="cms_post">Đồng bộ từ CMS</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2.5 w-full md:w-auto shrink-0 justify-end">
                      <button
                        onClick={() => {
                          setEditingKbItem(null);
                          setKbForm({ source_type: "faq", title: "", content: "", is_active: true });
                          setShowAddKbModal(true);
                        }}
                        className="bg-[#109173] hover:bg-[#0c7058] hover:scale-[1.02] hover:shadow-md hover:shadow-[#109173]/10 active:scale-97 text-white px-4.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus className="w-4.5 h-4.5" />
                        <span>Thêm FAQ thủ công</span>
                      </button>
                      <button
                        onClick={triggerCmsSync}
                        className="bg-[#3b82f6] hover:bg-blue-700 hover:scale-[1.02] hover:shadow-md hover:shadow-[#3b82f6]/10 active:scale-97 text-white px-4.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Database className="w-4.5 h-4.5" />
                        <span>Đồng bộ từ bài viết</span>
                      </button>
                    </div>
                  </div>

                  {/* List of FAQ cards */}
                  <div className="space-y-4">
                    {knowledge.map(item => (
                      <div 
                        key={item.id}
                        className={`bg-white border rounded-2xl p-6 shadow-xs relative group hover:border-[#109173] hover:shadow-sm transition-all duration-300 ${
                          !item.is_active ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            item.source_type === "faq" ? "bg-purple-100 text-purple-700 border border-purple-200/50" : "bg-blue-100 text-blue-700 border border-blue-200/50"
                          }`}>
                            {item.source_type === "faq" ? "Hỏi đáp thủ công" : "Đồng bộ CMS RAG"}
                          </span>
                          <button 
                            onClick={() => toggleKnowledgeActive(item)}
                            className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider cursor-pointer transition-all active:scale-95 ${
                              item.is_active ? "bg-emerald-100 text-emerald-800 border border-emerald-200/50" : "bg-stone-200 text-stone-600 border border-stone-300"
                            }`}
                          >
                            {item.is_active ? "Đang hoạt động" : "Đang ẩn"}
                          </button>
                        </div>

                        <h4 className="font-extrabold text-stone-850 text-xs sm:text-sm leading-snug">{item.title}</h4>
                        <p className="text-xs text-stone-500 mt-2.5 font-medium leading-relaxed whitespace-pre-wrap">{item.content}</p>

                        <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingKbItem(item);
                              setKbForm({
                                source_type: item.source_type === "cms_post" ? "faq" : item.source_type as any,
                                title: item.title,
                                content: item.content,
                                is_active: item.is_active === 1
                              });
                              setShowAddKbModal(true);
                            }}
                            className="p-1.5 border border-stone-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg cursor-pointer transition-all active:scale-95"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteKnowledgeItem(item.id)}
                            className="p-1.5 border border-stone-200 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg cursor-pointer transition-all active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CRUD Add Knowledge Modal */}
                  {showAddKbModal && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border">
                        <h3 className="text-sm font-extrabold text-stone-800 mb-4">{editingKbItem ? "Cập nhật tri thức FAQ" : "Thêm cặp Q&A thủ công mới"}</h3>
                        <form onSubmit={saveKnowledgeItem} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Loại nguồn tri thức</label>
                            <select
                              value={kbForm.source_type}
                              onChange={(e) => setKbForm({ ...kbForm, source_type: e.target.value as any })}
                              className="w-full bg-white border border-stone-250 hover:border-stone-300 rounded-xl px-4 py-2.5 text-xs font-extrabold text-stone-600 shadow-sm outline-none transition-all focus:border-[#109173] focus:ring-2 focus:ring-[#109173]/10 cursor-pointer appearance-none pr-9 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.6rem_center] bg-no-repeat"
                            >
                              <option value="faq">FAQ Hỏi đáp thủ công</option>
                              <option value="url">Website cào (URL)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Tiêu đề / Câu hỏi bệnh nhân</label>
                            <input 
                              type="text"
                              value={kbForm.title}
                              onChange={(e) => setKbForm({ ...kbForm, title: e.target.value })}
                              placeholder="Nhập tiêu đề hoặc câu hỏi..."
                              required
                              className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Nội dung chi tiết trả lời</label>
                            <textarea 
                              rows={5}
                              value={kbForm.content}
                              onChange={(e) => setKbForm({ ...kbForm, content: e.target.value })}
                              placeholder="Nhập câu trả lời chính xác từ Viện..."
                              required
                              className="w-full border border-stone-300 rounded-xl p-4 text-xs font-medium outline-none leading-relaxed"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox"
                              id="modalActive"
                              checked={kbForm.is_active}
                              onChange={(e) => setKbForm({ ...kbForm, is_active: e.target.checked })}
                              className="w-4 h-4 accent-[#109173]"
                            />
                            <label htmlFor="modalActive" className="text-xs font-bold text-stone-600 cursor-pointer">Áp dụng trực tiếp vào trợ lý ảo</label>
                          </div>
                          <div className="pt-4 border-t flex justify-end gap-2">
                            <button type="button" onClick={() => setShowAddKbModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 cursor-pointer">Hủy bỏ</button>
                            <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-[#109173] text-white hover:bg-[#0c7058] cursor-pointer hover:scale-[1.02]">Lưu tri thức</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ─── TAB 4: LỊCH KHÁM (SCHEDULES) ─────────────────── */}
              {activeTab === "schedule" && (
                <div className="space-y-6">
                  
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="font-extrabold text-stone-700 text-sm">Lịch trực bác sĩ ngoại trú</h3>
                      <p className="text-[11px] text-stone-400 mt-1">Dữ liệu thời gian trực được đưa trực tiếp vào RAG để chatbot phản hồi chính xác lịch khám bác sĩ.</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingScheduleItem(null);
                        setScheduleForm({ title: "", content: "", is_active: true });
                        setShowAddScheduleModal(true);
                      }}
                      className="bg-[#109173] hover:bg-[#0c7058] hover:scale-[1.02] active:scale-97 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-4.5 h-4.5" />
                      <span>Thêm lịch khám mới</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {schedules.map(item => (
                      <div 
                        key={item.id}
                        className={`bg-white border rounded-2xl p-6 shadow-xs relative group hover:border-[#109173] transition-all ${
                          !item.is_active ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="font-extrabold text-stone-850 text-xs sm:text-sm">{item.title}</h4>
                          <button
                            onClick={() => toggleScheduleActive(item)}
                            className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase cursor-pointer transition-all active:scale-95 ${
                              item.is_active ? "bg-emerald-100 text-emerald-800 border border-emerald-250/50" : "bg-stone-200 text-stone-600 border border-stone-300"
                            }`}
                          >
                            {item.is_active ? "Đang áp dụng" : "Tạm dừng"}
                          </button>
                        </div>
                        <pre className="text-xs text-stone-600 bg-stone-50 border p-4 rounded-xl font-mono leading-relaxed whitespace-pre-wrap">{item.content}</pre>
                        
                        <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingScheduleItem(item);
                              setScheduleForm({
                                title: item.title,
                                content: item.content,
                                is_active: item.is_active === 1
                              });
                              setShowAddScheduleModal(true);
                            }}
                            className="p-1.5 border bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg cursor-pointer transition-all active:scale-95"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteSchedule(item.id)}
                            className="p-1.5 border bg-red-50 text-red-500 hover:bg-red-100 rounded-lg cursor-pointer transition-all active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add/Edit Schedule Modal */}
                  {showAddScheduleModal && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border">
                        <h3 className="text-sm font-extrabold text-stone-800 mb-4">{editingScheduleItem ? "Cập nhật lịch trực bác sĩ" : "Thêm lịch trực y khoa"}</h3>
                        <form onSubmit={saveSchedule} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Tiêu đề lịch khám</label>
                            <input 
                              type="text"
                              value={scheduleForm.title}
                              onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                              placeholder="Ví dụ: Lịch trực ngoại trú khoa xương khớp..."
                              required
                              className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-1">Chi tiết ca trực của bác sĩ</label>
                            <textarea 
                              rows={5}
                              value={scheduleForm.content}
                              onChange={(e) => setScheduleForm({ ...scheduleForm, content: e.target.value })}
                              placeholder="Mô tả chi tiết ca trực của từng bác sĩ..."
                              required
                              className="w-full border border-stone-300 rounded-xl p-4 text-xs font-mono outline-none leading-relaxed"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox"
                              id="schedActive"
                              checked={scheduleForm.is_active}
                              onChange={(e) => setScheduleForm({ ...scheduleForm, is_active: e.target.checked })}
                              className="w-4 h-4 accent-[#109173]"
                            />
                            <label htmlFor="schedActive" className="text-xs font-bold text-stone-600 cursor-pointer">Đang áp dụng</label>
                          </div>
                          <div className="pt-4 border-t flex justify-end gap-2">
                            <button type="button" onClick={() => setShowAddScheduleModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 cursor-pointer">Hủy bỏ</button>
                            <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-[#109173] text-white hover:bg-[#0c7058] cursor-pointer hover:scale-[1.02]">Lưu thông tin</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ─── TAB 5: HỘI THOẠI (CHAT LOGS HISTORY) ──────────── */}
              {activeTab === "history" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left List Stack */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white border rounded-2xl p-4 shadow-xs">
                      <label className="block text-[10px] font-extrabold text-stone-500 uppercase mb-2">Lọc theo đánh giá</label>
                      <div className="relative">
                        <select
                          value={filterSessionRating}
                          onChange={(e) => setFilterSessionRating(e.target.value)}
                          className="w-full bg-white border border-stone-250 hover:border-stone-300 rounded-xl px-4 py-2.5 text-xs font-extrabold text-stone-600 shadow-sm outline-none transition-all focus:border-[#109173] focus:ring-2 focus:ring-[#109173]/10 cursor-pointer appearance-none pr-9 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.6rem_center] bg-no-repeat"
                        >
                          <option value="">Tất cả hội thoại</option>
                          <option value="1">Bệnh nhân hài lòng 👍</option>
                          <option value="-1">Bệnh nhân chưa hài lòng 👎</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                      {conversations.map(session => (
                        <button
                          key={session.session_id}
                          onClick={() => setSelectedSessionId(session.session_id)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all text-xs flex flex-col gap-2 cursor-pointer hover:scale-[1.01] duration-200 active:scale-98 ${
                            selectedSessionId === session.session_id
                              ? "bg-white border-[#109173] shadow-md shadow-[#109173]/5 font-bold"
                              : "bg-white hover:bg-stone-50 border-stone-200"
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-extrabold text-stone-700 truncate max-w-[130px]">{session.session_id}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {session.rating === 1 && <span className="text-emerald-600">👍</span>}
                              {session.rating === -1 && <span className="text-rose-600">👎</span>}
                              <span className="text-[9px] text-stone-400 font-bold">{new Date(session.updated_at).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          <p className="text-stone-500 truncate text-[11px] leading-relaxed italic">"{session.first_message || "Đang kết nối..."}"</p>
                          
                          <div className="flex justify-between items-center text-[9px] text-stone-400 border-t pt-2 mt-1">
                            <span className="bg-stone-100 px-2 py-0.5 rounded-full font-bold">{session.message_count} tin nhắn</span>
                            <span className="truncate max-w-[100px]">{session.ip_address || "LAN"}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right bubble inspector */}
                  <div className="lg:col-span-2 bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs flex flex-col min-h-[460px]">
                    {loadingSessionDetails ? (
                      <div className="flex flex-col items-center justify-center flex-1 py-16 text-stone-400 gap-2">
                        <RefreshCw className="w-7 h-7 animate-spin text-[#109173]" />
                        <span className="text-xs font-bold">Đang tải chi tiết hội thoại...</span>
                      </div>
                    ) : selectedConversation ? (
                      <div className="flex flex-col h-full justify-between flex-1">
                        
                        <div className="border-b pb-4 mb-4 flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-extrabold text-stone-800 text-xs">Phiên hội thoại: {selectedConversation.conversation.session_id}</h4>
                            <span className="text-[9px] text-stone-400 mt-1 block">Bắt đầu: {new Date(selectedConversation.conversation.created_at).toLocaleString("vi-VN")}</span>
                          </div>
                          <div className="text-right shrink-0">
                            {selectedConversation.conversation.rating === 1 && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-3.5 py-1 rounded-full uppercase border border-emerald-200/50">Hài lòng 👍</span>}
                            {selectedConversation.conversation.rating === -1 && <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-3.5 py-1 rounded-full uppercase border border-rose-250/50">Chưa hài lòng 👎</span>}
                            {selectedConversation.conversation.feedback_notes && (
                              <p className="text-[10px] text-stone-500 italic mt-1 bg-stone-50 border p-2.5 rounded-xl">Ý kiến người bệnh: "{selectedConversation.conversation.feedback_notes}"</p>
                            )}
                          </div>
                        </div>

                        {/* Interactive scroll log bubbles */}
                        <div className="flex-1 space-y-4 max-h-[350px] overflow-y-auto pr-1 pb-4">
                          {selectedConversation.messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                              <span className="text-[9px] font-bold text-stone-400 uppercase mb-1 px-1">{msg.role === "user" ? "Bệnh nhân" : "Trợ lý Y Dược AI"}</span>
                              <div className={`p-3.5 rounded-2xl max-w-[80%] text-xs leading-relaxed shadow-2xs ${
                                msg.role === "user"
                                  ? "bg-[#109173] text-white rounded-tr-none shadow-md shadow-[#109173]/10 font-bold"
                                  : "bg-stone-50 border border-stone-250 text-stone-750 rounded-tl-none font-medium font-sans"
                              }`}>
                                <p className="whitespace-pre-line">{msg.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t pt-3 text-[10px] text-stone-400 text-center leading-relaxed">
                          * Dữ liệu logs được bảo vệ bởi chuẩn an toàn thông tin y khoa của Viện Y dược học Dân tộc.
                        </div>

                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-center items-center py-16 text-stone-400 gap-2">
                        <Bot className="w-12 h-12 text-stone-200" />
                        <span className="text-xs font-bold">Vui lòng chọn một cuộc hội thoại ở danh sách bên trái.</span>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ─── TAB 6: CẦN BỔ SUNG (UNRESOLVED) ───────────────── */}
              {activeTab === "unresolved" && (
                <div className="space-y-6">
                  
                  <div className="border-b pb-4">
                    <h3 className="font-extrabold text-stone-700 text-sm">Câu hỏi chưa giải quyết</h3>
                    <p className="text-[11px] text-stone-400 mt-1">Các câu hỏi bệnh nhân hỏi mà AI chưa tìm thấy dữ liệu đối sánh khớp trong cơ sở tri thức.</p>
                  </div>

                  {unresolved.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-dashed border-stone-250 rounded-3xl text-stone-400">
                      <CheckCircle className="w-12 h-12 mx-auto text-[#109173] mb-2 animate-bounce" />
                      <p className="text-xs font-extrabold">Tuyệt vời! Không còn câu hỏi chưa khớp nào.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unresolved.map(item => (
                        <div key={item.id} className="bg-white border rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-[#109173] transition-all hover:scale-[1.005] hover:shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                            <div>
                              <h4 className="font-extrabold text-stone-750 text-xs">"{item.question}"</h4>
                              <div className="flex gap-2 items-center mt-1.5">
                                <span className="bg-rose-50 text-rose-700 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase border border-rose-100">Chưa khớp</span>
                                <span className="text-[10px] text-stone-400 font-bold">Ghi nhận ngày: {new Date(item.created_at).toLocaleDateString("vi-VN")}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2.5">
                            <button
                              onClick={() => resolveUnresolved(item)}
                              title="Tạo FAQ để giải quyết"
                              className="p-2.5 border border-emerald-250 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl cursor-pointer transition-all active:scale-95 hover:scale-105"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUnresolved(item.id)}
                              title="Bỏ qua câu này"
                              className="p-2.5 border bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-xl cursor-pointer transition-all active:scale-95 hover:scale-105"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* ─── TAB 7: CÀI ĐẶT (HOSPITAL SETTINGS) ───────────── */}
              {activeTab === "config" && (
                <form onSubmit={saveHospitalConfigs} className="space-y-6">
                  
                  {/* Outer hospital info card mimicking screenshot 2 exactly */}
                  <div className="bg-white border rounded-3xl p-8 shadow-sm space-y-8 max-w-4xl mx-auto relative z-10">
                    
                    <div className="border-b pb-4">
                      <h3 className="font-extrabold text-stone-850 text-sm">Cài đặt thông tin hệ thống</h3>
                      <p className="text-[11px] text-stone-400 mt-0.5">Quản lý cấu hình địa chỉ, thông tin của Viện cùng các cài đặt kỹ thuật Gemini AI.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Left side: Hospital info fields */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-[#109173] uppercase tracking-wider border-b pb-2 mb-2">Thông tin liên hệ của Viện</h4>
                        
                        {/* TÊN BỆNH VIỆN Card */}
                        <div className="flex items-center gap-3 border p-4.5 rounded-2xl hover:border-[#109173] transition-colors bg-stone-50/30">
                          <div className="p-2 bg-emerald-50 text-[#109173] rounded-xl shrink-0">
                            <Shield className="w-4.5 h-4.5" />
                          </div>
                          <div className="w-full">
                            <span className="text-[9px] text-stone-400 font-black uppercase tracking-wider block">Tên đơn vị đầy đủ</span>
                            <input 
                              type="text"
                              value={hospitalConfigs.hospital_name}
                              onChange={(e) => setHospitalConfigs({ ...hospitalConfigs, hospital_name: e.target.value })}
                              required
                              className="text-xs font-bold text-stone-700 outline-none bg-transparent w-full border-b border-transparent focus:border-[#109173] pb-0.5 mt-0.5"
                            />
                          </div>
                        </div>

                        {/* CƠ SỞ 1 Card */}
                        <div className="flex items-center gap-3 border p-4.5 rounded-2xl hover:border-[#109173] transition-colors bg-stone-50/30">
                          <div className="p-2 bg-emerald-50 text-[#109173] rounded-xl shrink-0">
                            <MapPin className="w-4.5 h-4.5" />
                          </div>
                          <div className="w-full">
                            <span className="text-[9px] text-stone-400 font-black uppercase tracking-wider block">Cơ sở 1</span>
                            <input 
                              type="text"
                              value={hospitalConfigs.hospital_address_1}
                              onChange={(e) => setHospitalConfigs({ ...hospitalConfigs, hospital_address_1: e.target.value })}
                              required
                              className="text-xs font-bold text-stone-700 outline-none bg-transparent w-full border-b border-transparent focus:border-[#109173] pb-0.5 mt-0.5"
                            />
                          </div>
                        </div>

                        {/* CƠ SỞ 2 Card */}
                        <div className="flex items-center gap-3 border p-4.5 rounded-2xl hover:border-[#109173] transition-colors bg-stone-50/30">
                          <div className="p-2 bg-emerald-50 text-[#109173] rounded-xl shrink-0">
                            <MapPin className="w-4.5 h-4.5" />
                          </div>
                          <div className="w-full">
                            <span className="text-[9px] text-stone-400 font-black uppercase tracking-wider block">Cơ sở 2</span>
                            <input 
                              type="text"
                              value={hospitalConfigs.hospital_address_2}
                              onChange={(e) => setHospitalConfigs({ ...hospitalConfigs, hospital_address_2: e.target.value })}
                              required
                              className="text-xs font-bold text-stone-700 outline-none bg-transparent w-full border-b border-transparent focus:border-[#109173] pb-0.5 mt-0.5"
                            />
                          </div>
                        </div>

                        {/* ĐIỆN THOẠI Card */}
                        <div className="flex items-center gap-3 border p-4.5 rounded-2xl hover:border-[#109173] transition-colors bg-stone-50/30">
                          <div className="p-2 bg-emerald-50 text-[#109173] rounded-xl shrink-0">
                            <Phone className="w-4.5 h-4.5" />
                          </div>
                          <div className="w-full">
                            <span className="text-[9px] text-stone-400 font-black uppercase tracking-wider block">Số điện thoại hotline</span>
                            <input 
                              type="text"
                              value={hospitalConfigs.hospital_phone}
                              onChange={(e) => setHospitalConfigs({ ...hospitalConfigs, hospital_phone: e.target.value })}
                              required
                              className="text-xs font-bold text-stone-700 outline-none bg-transparent w-full border-b border-transparent focus:border-[#109173] pb-0.5 mt-0.5"
                            />
                          </div>
                        </div>

                        {/* GIỜ LÀM VIỆC Card */}
                        <div className="flex items-center gap-3 border p-4.5 rounded-2xl hover:border-[#109173] transition-colors bg-stone-50/30">
                          <div className="p-2 bg-emerald-50 text-[#109173] rounded-xl shrink-0">
                            <Clock className="w-4.5 h-4.5" />
                          </div>
                          <div className="w-full">
                            <span className="text-[9px] text-stone-400 font-black uppercase tracking-wider block">Giờ làm việc</span>
                            <input 
                              type="text"
                              value={hospitalConfigs.hospital_hours}
                              onChange={(e) => setHospitalConfigs({ ...hospitalConfigs, hospital_hours: e.target.value })}
                              required
                              className="text-xs font-bold text-stone-700 outline-none bg-transparent w-full border-b border-transparent focus:border-[#109173] pb-0.5 mt-0.5"
                            />
                          </div>
                        </div>

                        {/* WEBSITE Card */}
                        <div className="flex items-center gap-3 border p-4.5 rounded-2xl hover:border-[#109173] transition-colors bg-stone-50/30">
                          <div className="p-2 bg-emerald-50 text-[#109173] rounded-xl shrink-0">
                            <Globe className="w-4.5 h-4.5" />
                          </div>
                          <div className="w-full">
                            <span className="text-[9px] text-stone-400 font-black uppercase tracking-wider block">Đường dẫn Website</span>
                            <input 
                              type="text"
                              value={hospitalConfigs.hospital_website}
                              onChange={(e) => setHospitalConfigs({ ...hospitalConfigs, hospital_website: e.target.value })}
                              required
                              className="text-xs font-bold text-stone-700 outline-none bg-transparent w-full border-b border-transparent focus:border-[#109173] pb-0.5 mt-0.5"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right side: AI Gemini configurations */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-[#109173] uppercase tracking-wider border-b pb-2 mb-2">Cấu hình kỹ thuật Gemini AI</h4>
                        
                        {/* Model select list */}
                        <div className="flex flex-col gap-1 border p-4.5 rounded-2xl bg-stone-50/30 hover:border-[#109173] transition-colors">
                          <label className="text-[9px] text-stone-400 font-black uppercase tracking-wider">Mô hình chạy chính</label>
                          <div className="relative mt-1">
                            <select
                              value={hospitalConfigs.ai_model}
                              onChange={(e) => setHospitalConfigs({ ...hospitalConfigs, ai_model: e.target.value })}
                              className="w-full bg-white border border-stone-250 hover:border-stone-300 rounded-xl px-4 py-2.5 text-xs font-extrabold text-stone-600 shadow-sm outline-none transition-all focus:border-[#109173] focus:ring-2 focus:ring-[#109173]/10 cursor-pointer appearance-none pr-9 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.6rem_center] bg-no-repeat"
                            >
                              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Khuyên dùng - Nhanh nhất)</option>
                              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                              <option value="gemini-flash-latest">Gemini Flash Latest</option>
                              <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                            </select>
                          </div>
                        </div>

                        {/* Temperature range slider */}
                        <div className="flex flex-col gap-1 border p-4.5 rounded-2xl bg-stone-50/30 hover:border-[#109173] transition-colors">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] text-stone-400 font-black uppercase tracking-wider">Độ sáng tạo (Temperature)</label>
                            <span className="text-xs font-extrabold text-[#109173]">{hospitalConfigs.temperature}</span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max="1.0"
                            step="0.1"
                            value={hospitalConfigs.temperature}
                            onChange={(e) => setHospitalConfigs({ ...hospitalConfigs, temperature: e.target.value })}
                            className="w-full accent-[#109173] mt-2 cursor-pointer"
                          />
                        </div>

                        {/* Widget theme color */}
                        <div className="flex flex-col gap-1 border p-4.5 rounded-2xl bg-stone-50/30 hover:border-[#109173] transition-colors">
                          <label className="text-[9px] text-stone-400 font-black uppercase tracking-wider">Màu sắc chủ đạo của bong bóng Chat</label>
                          <div className="flex items-center gap-3 mt-1.5">
                            <input 
                              type="color"
                              value={hospitalConfigs.widget_theme_color}
                              onChange={(e) => setHospitalConfigs({ ...hospitalConfigs, widget_theme_color: e.target.value })}
                              className="w-10 h-10 border border-stone-250 rounded-xl cursor-pointer"
                            />
                            <input 
                              type="text"
                              value={hospitalConfigs.widget_theme_color}
                              onChange={(e) => setHospitalConfigs({ ...hospitalConfigs, widget_theme_color: e.target.value })}
                              className="flex-1 border border-stone-250 rounded-xl px-3.5 py-2 text-xs font-bold text-stone-700 outline-none uppercase"
                            />
                          </div>
                        </div>

                        {/* Welcome message */}
                        <div className="flex flex-col gap-1 border p-4.5 rounded-2xl bg-stone-50/30 hover:border-[#109173] transition-colors">
                          <label className="text-[9px] text-stone-400 font-black uppercase tracking-wider">Câu chào mừng mặc định ngoài trang chủ</label>
                          <input 
                            type="text"
                            value={hospitalConfigs.welcome_message}
                            onChange={(e) => setHospitalConfigs({ ...hospitalConfigs, welcome_message: e.target.value })}
                            required
                            className="border border-stone-250 focus:border-[#109173] outline-none rounded-xl px-4 py-2.5 text-xs font-bold bg-white mt-1.5"
                          />
                        </div>
                      </div>

                    </div>

                    {/* System Prompt (Full-width) */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-stone-500 uppercase tracking-wider">System Prompt (Định vị vai trò & Persona của AI)</label>
                      <textarea 
                        rows={6}
                        value={hospitalConfigs.system_prompt}
                        onChange={(e) => setHospitalConfigs({ ...hospitalConfigs, system_prompt: e.target.value })}
                        required
                        className="w-full border border-stone-300 rounded-2xl p-4 text-xs font-mono outline-none focus:border-[#109173] focus:ring-2 focus:ring-[#109173]/10 leading-relaxed"
                      />
                    </div>

                    {/* Submit Bar at the bottom */}
                    <div className="pt-6 border-t flex justify-end gap-3 items-center">
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-2 max-w-lg text-left mr-auto">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[9px] text-amber-800 leading-relaxed font-bold">
                          Lưu ý: Thay đổi cấu hình này sẽ tự động cập nhật ngay lập tức cho tất cả bệnh nhân truy cập ngoài trang chủ của Viện Y dược học Dân tộc.
                        </p>
                      </div>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="bg-[#109173] hover:bg-[#0c7058] hover:scale-[1.02] active:scale-95 text-white text-xs px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-md shadow-[#109173]/15 transition-all cursor-pointer shrink-0"
                      >
                        <Save className="w-4.5 h-4.5" />
                        <span>Lưu cấu hình hệ thống</span>
                      </button>
                    </div>

                  </div>
                </form>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}
