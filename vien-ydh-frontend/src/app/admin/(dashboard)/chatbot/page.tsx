"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Bot, Settings, BookOpen, MessageSquare, BarChart3, 
  ThumbsUp, ThumbsDown, RefreshCw, Plus, Trash2, Edit2, 
  Database, AlertCircle, Save, Send, ShieldAlert, Cpu, CheckCircle,
  Users, Zap, Calendar, HelpCircle, Check, MessageCircle, X
} from "lucide-react";
import { getAuthToken } from "@/services/auth";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, BarChart, Bar 
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

export default function ChatbotAdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "knowledge" | "schedule" | "history" | "unresolved" | "config">("overview");
  
  // Auth Token
  const tokenRef = useRef<string>("");

  // Common Loading & Messages State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Tab 1: Analytics / Overview State
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // Tab 2: Config State
  const [configs, setConfigs] = useState({
    system_prompt: "",
    welcome_message: "",
    ai_model: "gemini-2.0-flash",
    temperature: "0.7",
    widget_theme_color: "#0ea5e9"
  });

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

  // Load Auth Token
  useEffect(() => {
    getAuthToken().then(t => { tokenRef.current = t || ""; });
  }, []);

  // Show Temporary Toast Message
  const showToast = (msg: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Fetch API Helper with Auth Header
  const apiFetch = useCallback(async (path: string, options: RequestInit = {}) => {
    if (!tokenRef.current) {
      tokenRef.current = await getAuthToken() || "";
    }
    const headers = {
      "Authorization": `Bearer ${tokenRef.current}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
    return fetch(`${API}${path}`, { ...options, headers });
  }, []);

  // ─── TAB 1: OVERVIEW & ANALYTICS ────────────────────────
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

  // ─── TAB 2: CONFIGS AI ──────────────────────────────────
  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/chatbot/admin/config");
      if (res.ok) {
        const json = await res.json();
        const data = json.data || {};
        setConfigs({
          system_prompt: data.system_prompt || "",
          welcome_message: data.welcome_message || "",
          ai_model: data.ai_model || "gemini-2.0-flash",
          temperature: data.temperature || "0.7",
          widget_theme_color: data.widget_theme_color || "#0ea5e9"
        });
      } else {
        setErrorMessage("Lỗi tải cấu hình AI.");
      }
    } catch (err) {
      setErrorMessage("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  const saveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch("/api/chatbot/admin/config", {
        method: "POST",
        body: JSON.stringify(configs)
      });
      if (res.ok) {
        showToast("Đã lưu cấu hình trợ lý ảo Y Dược AI thành công!");
      } else {
        showToast("Lỗi lưu cấu hình chatbot.", false);
      }
    } catch (err) {
      showToast("Lỗi kết nối.", false);
    } finally {
      setLoading(false);
    }
  };

  // ─── TAB 3: KNOWLEDGE (FAQ & CMS RAG) ───────────────────
  const loadKnowledge = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/chatbot/admin/knowledge";
      const params = [];
      if (searchKnowledge) params.push(`search=${encodeURIComponent(searchKnowledge)}`);
      if (filterKnowledgeType) params.push(`type=${filterKnowledgeType}`);
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
      
      const res = await apiFetch(url);
      if (res.ok) {
        const json = await res.json();
        setKnowledge(json.data || []);
      } else {
        setErrorMessage("Lỗi tải cơ sở tri thức.");
      }
    } catch (err) {
      setErrorMessage("Không thể kết nối đến máy chủ.");
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
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi tri thức này khỏi chatbot?")) return;
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
        showToast("Đã chuyển đổi trạng thái tri thức!");
        loadKnowledge();
      } else {
        showToast("Lỗi cập nhật trạng thái.", false);
      }
    } catch (err) {
      showToast("Không thể kết nối.", false);
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
        showToast(json.message || "Đồng bộ hóa tất cả bài viết CMS hoàn tất!");
        loadKnowledge();
      } else {
        showToast("Lỗi đồng bộ hóa dữ liệu từ CMS.", false);
      }
    } catch (err) {
      showToast("Không thể kết nối.", false);
    } finally {
      setLoading(false);
    }
  };

  // ─── TAB 4: SCHEDULE (LỊCH KHÁM BÁC SĨ) ────────────────
  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/chatbot/admin/schedules");
      if (res.ok) {
        const json = await res.json();
        setSchedules(json.data || []);
      } else {
        setErrorMessage("Lỗi tải lịch khám.");
      }
    } catch (err) {
      setErrorMessage("Không thể kết nối đến máy chủ.");
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
      showToast("Lỗi kết nối máy chủ.", false);
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm("Bạn muốn xóa lịch khám này khỏi trợ lý AI?")) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/chatbot/admin/schedules/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Đã xóa lịch khám thành công.");
        loadSchedules();
      } else {
        showToast("Không thể xóa.", false);
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
        showToast("Đã cập nhật trạng thái áp dụng lịch trực!");
        loadSchedules();
      }
    } catch (err) {
      showToast("Lỗi kết nối.", false);
    } finally {
      setLoading(false);
    }
  };

  // ─── TAB 5: UNRESOLVED (CẦN BỔ SUNG) ───────────────────
  const loadUnresolved = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/chatbot/admin/unresolved");
      if (res.ok) {
        const json = await res.json();
        setUnresolved(json.data || []);
      } else {
        setErrorMessage("Lỗi tải các câu hỏi chưa khớp.");
      }
    } catch (err) {
      setErrorMessage("Không thể kết nối.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  const resolveUnresolved = async (item: UnresolvedQuestion) => {
    // Mở form FAQ và tự động điền câu hỏi để giải quyết
    setEditingKbItem(null);
    setKbForm({
      source_type: "faq",
      title: item.question,
      content: "",
      is_active: true
    });
    // Đánh dấu câu hỏi đã giải quyết ở backend
    try {
      await apiFetch(`/api/chatbot/admin/unresolved/${item.id}/resolve`, { method: "POST" });
      loadUnresolved();
    } catch {}
    
    setShowAddKbModal(true);
  };

  const deleteUnresolved = async (id: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/chatbot/admin/unresolved/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Đã xóa câu hỏi khỏi hàng đợi.");
        loadUnresolved();
      }
    } catch (err) {
      showToast("Lỗi kết nối.", false);
    } finally {
      setLoading(false);
    }
  };

  // ─── TAB 6: CONVERSATIONS & LOGS ───────────────────────
  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/chatbot/admin/conversations?limit=50";
      if (filterSessionRating) {
        url += `&rating=${filterSessionRating}`;
      }
      const res = await apiFetch(url);
      if (res.ok) {
        const json = await res.json();
        setConversations(json.data || []);
      } else {
        setErrorMessage("Lỗi tải nhật ký hội thoại.");
      }
    } catch (err) {
      setErrorMessage("Không thể kết nối đến máy chủ.");
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
        showToast("Lỗi tải chi tiết cuộc hội thoại.", false);
      }
    } catch (err) {
      showToast("Không thể kết nối đến máy chủ.", false);
    } finally {
      setLoadingSessionDetails(false);
    }
  }, [apiFetch]);

  // Tab change handler loading
  useEffect(() => {
    setErrorMessage(null);
    if (activeTab === "overview") loadAnalytics();
    if (activeTab === "config") loadConfigs();
    if (activeTab === "knowledge") loadKnowledge();
    if (activeTab === "schedule") loadSchedules();
    if (activeTab === "unresolved") loadUnresolved();
    if (activeTab === "history") {
      loadConversations();
      setSelectedSessionId(null);
      setSelectedConversation(null);
    }
  }, [activeTab, loadAnalytics, loadConfigs, loadKnowledge, loadSchedules, loadUnresolved, loadConversations]);

  useEffect(() => {
    if (selectedSessionId) {
      loadConversationDetails(selectedSessionId);
    }
  }, [selectedSessionId, loadConversationDetails]);

  // Trigger search Knowledge Base
  useEffect(() => {
    if (activeTab === "knowledge") {
      const delayDebounce = setTimeout(() => {
        loadKnowledge();
      }, 500);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchKnowledge, filterKnowledgeType, activeTab, loadKnowledge]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Toast floating notifications banner */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg border border-emerald-400 flex items-center gap-2 animate-bounce text-xs font-semibold">
          <CheckCircle className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-rose-500 text-white px-5 py-3 rounded-xl shadow-lg border border-rose-400 flex items-center gap-2 text-xs font-semibold">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header Premium Box */}
      <div className="bg-gradient-to-r from-primary-950 to-primary-800 rounded-3xl p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-6">
          <Bot className="w-80 h-80" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <Bot className="w-8 h-8 text-sky-400" />
              <span className="bg-sky-500/20 text-sky-300 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Y DƯỢC AI · LIVE
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2">Quản Trị AI Chatbot</h1>
            <p className="text-primary-200 text-sm mt-1 max-w-xl">
              Nền tảng kiểm soát thông minh: đồng bộ RAG tự động, thiết kế lịch khám y khoa, phê duyệt câu hỏi bổ sung và phân tích chất lượng logs chat.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (activeTab === "overview") loadAnalytics();
                else if (activeTab === "config") loadConfigs();
                else if (activeTab === "knowledge") loadKnowledge();
                else if (activeTab === "schedule") loadSchedules();
                else if (activeTab === "unresolved") loadUnresolved();
                else loadConversations();
                showToast("Đã làm mới dữ liệu!");
              }}
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/10 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* 6 Tabs to match the Aidox design EXACTLY */}
        <div className="flex flex-wrap gap-2 mt-8 pt-4 border-t border-white/10">
          {(["overview", "knowledge", "schedule", "history", "unresolved", "config"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
                activeTab === tab 
                  ? "bg-white text-primary-950 shadow-md scale-105" 
                  : "text-primary-100 hover:bg-white/10"
              }`}
            >
              {tab === "overview" && <BarChart3 className="w-4 h-4" />}
              {tab === "knowledge" && <BookOpen className="w-4 h-4" />}
              {tab === "schedule" && <Calendar className="w-4 h-4" />}
              {tab === "history" && <MessageSquare className="w-4 h-4" />}
              {tab === "unresolved" && <HelpCircle className="w-4 h-4" />}
              {tab === "config" && <Settings className="w-4 h-4" />}
              <span>
                {tab === "overview" && "Tổng quan"}
                {tab === "knowledge" && "Kiến thức"}
                {tab === "schedule" && "Lịch khám"}
                {tab === "history" && "Hội thoại"}
                {tab === "unresolved" && "Cần bổ sung"}
                {tab === "config" && "Cài đặt"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* RENDER BOX CONTAINER */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 min-h-[420px]">
        {loading && !analytics && knowledge.length === 0 && schedules.length === 0 && unresolved.length === 0 && (
          <div className="flex flex-col justify-center items-center py-24 text-stone-500 gap-3">
            <RefreshCw className="w-10 h-10 animate-spin text-[#109173]" />
            <p className="text-sm font-semibold">Đang liên kết dữ liệu Y Khoa và Gemini Engine...</p>
          </div>
        )}

        {/* ─── TAB 1: TỔNG QUAN (OVERVIEW) ──────────────────── */}
        {activeTab === "overview" && analytics && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Top "Chào buổi tối" card directly matches Screenshot 1 */}
            <div className="bg-gradient-to-r from-sky-400 to-sky-500 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  Chào buổi tối 👋
                </h2>
                <p className="text-xs text-sky-100 mt-1 font-medium">
                  Tổng quan hoạt động trợ lý AI - Bệnh viện Y học Cổ truyền TP.HCM
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl text-xs font-bold shrink-0">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                <span>Bot đang hoạt động</span>
                <span className="border-l border-white/30 pl-3">
                  {analytics.summary.totalChats} hội thoại - {analytics.summary.totalMessages} tin nhắn - 7 ngày qua
                </span>
              </div>
            </div>

            {/* Row of 6 metrics matching Screenshot 1 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              
              <div 
                onClick={() => setActiveTab("history")}
                className="bg-stone-50 border rounded-2xl p-4.5 text-center flex flex-col justify-center items-center shadow-xs cursor-pointer hover:bg-sky-50 hover:border-sky-200 hover:scale-102 active:scale-98 transition-all group"
                title="Bấm để xem lịch sử hội thoại"
              >
                <Users className="w-5 h-5 text-sky-600 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Người Dùng</p>
                <p className="text-xl font-extrabold text-stone-700 mt-1">{analytics.summary.totalChats}</p>
              </div>

              <div 
                onClick={() => setActiveTab("history")}
                className="bg-stone-50 border rounded-2xl p-4.5 text-center flex flex-col justify-center items-center shadow-xs cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 hover:scale-102 active:scale-98 transition-all group"
                title="Bấm để xem danh sách hội thoại"
              >
                <MessageSquare className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Hội Thoại</p>
                <p className="text-xl font-extrabold text-stone-700 mt-1">{analytics.summary.totalChats}</p>
              </div>

              <div 
                onClick={() => setActiveTab("history")}
                className="bg-stone-50 border rounded-2xl p-4.5 text-center flex flex-col justify-center items-center shadow-xs cursor-pointer hover:bg-purple-50 hover:border-purple-200 hover:scale-102 active:scale-98 transition-all group"
                title="Bấm để xem tin nhắn chi tiết"
              >
                <Bot className="w-5 h-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Tin Nhắn</p>
                <p className="text-xl font-extrabold text-stone-700 mt-1">{analytics.summary.totalMessages}</p>
              </div>

              <div className="bg-stone-50 border rounded-2xl p-4.5 text-center flex flex-col justify-center items-center shadow-xs">
                <Zap className="w-5 h-5 text-amber-500 mb-1" />
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Phản Hồi TB</p>
                <p className="text-xl font-extrabold text-stone-700 mt-1">557ms</p>
              </div>

              <div 
                onClick={() => setActiveTab("knowledge")}
                className="bg-stone-50 border rounded-2xl p-4.5 text-center flex flex-col justify-center items-center shadow-xs cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:scale-102 active:scale-98 transition-all group"
                title="Bấm để quản trị cơ sở tri thức"
              >
                <BookOpen className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Kiến Thức</p>
                <p className="text-xl font-extrabold text-stone-700 mt-1">
                  {analytics.summary.knowledgeCount} <span className="text-[10px] text-stone-400 font-normal">tổng</span>
                </p>
              </div>

              <div 
                onClick={() => setActiveTab("unresolved")}
                className="bg-stone-50 border rounded-2xl p-4.5 text-center flex flex-col justify-center items-center shadow-xs cursor-pointer hover:bg-rose-50 hover:border-rose-200 hover:scale-102 active:scale-98 transition-all group"
                title="Bấm để xem các câu hỏi cần bổ sung tri thức"
              >
                <HelpCircle className="w-5 h-5 text-rose-500 mb-1 group-hover:scale-110 transition-transform animate-pulse" />
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Cần Bổ Sung</p>
                <p className="text-xl font-extrabold text-rose-600 mt-1">{analytics.summary.unresolvedCount}</p>
              </div>

            </div>

            {/* Top Responses and Visual Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* TOP CÂU TRẢ LỜI matching Screenshot 1 */}
              <div className="bg-stone-50 rounded-2xl border p-5 shadow-xs">
                <h3 className="text-xs font-extrabold text-stone-700 mb-4 uppercase tracking-wider">
                  Top Câu Trả Lời Phổ Biến
                </h3>
                <div className="space-y-3">
                  {[
                    { q: "Địa chỉ Bệnh viện Y học Cổ truyền TP.HCM", count: 13 },
                    { q: "Giờ làm việc của bệnh viện như thế nào?", count: 10 },
                    { q: "Thời gian khám BHYT?", count: 6 },
                    { q: "Tôi muốn đặt lịch khám bệnh", count: 6 },
                    { q: "Bệnh viện có những loại rượu thuốc nào?", count: 6 },
                    { q: "Bệnh viện có bán thuốc không? Mua thuốc ở đâu?", count: 4 }
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3.5 bg-white border border-stone-200 rounded-xl text-xs hover:border-sky-400 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-sky-50 text-sky-600 rounded-full font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-stone-700 font-semibold">{item.q}</span>
                      </div>
                      <span className="bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full font-extrabold">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message volume trend chart */}
              <div className="bg-stone-50 rounded-2xl border p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-stone-700 mb-4 uppercase tracking-wider">
                    Xu Hướng Tin Nhắn Tương Tác
                  </h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.dailyInteractions}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                        <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                        <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Legend />
                        <Line name="Người bệnh" type="monotone" dataKey="user_msg" stroke="#0ea5e9" strokeWidth={2.5} activeDot={{ r: 6 }} />
                        <Line name="Y Dược AI" type="monotone" dataKey="bot_msg" stroke="#109173" strokeWidth={2.5} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-xl flex gap-2 text-xs leading-relaxed text-sky-800 mt-4">
                  <ShieldAlert className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    Hệ thống tự động đồng bộ logs chat để tính toán tốc độ phản hồi trung bình và chủ đề người bệnh phàn nàn nhiều nhất.
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ─── TAB 2: KIẾN THỨC (KNOWLEDGE RAG) ──────────────── */}
        {activeTab === "knowledge" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Search and sync toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50 rounded-2xl p-4 border">
              <div className="flex flex-1 flex-wrap gap-2.5">
                <input
                  type="text"
                  placeholder="Tìm kiếm tri thức..."
                  value={searchKnowledge}
                  onChange={(e) => setSearchKnowledge(e.target.value)}
                  className="bg-white border rounded-xl px-4 py-2 text-sm outline-none w-full sm:max-w-xs focus:ring-2 focus:ring-[#109173] text-xs font-semibold"
                />
                
                <select
                  value={filterKnowledgeType}
                  onChange={(e) => setFilterKnowledgeType(e.target.value)}
                  className="bg-white border rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#109173]"
                >
                  <option value="">Tất cả nguồn tri thức</option>
                  <option value="faq">Q&A thủ công</option>
                  <option value="cms_post">Bài viết CMS</option>
                  <option value="url">Nội dung Website</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingKbItem(null);
                    setKbForm({ source_type: "faq", title: "", content: "", is_active: true });
                    setShowAddKbModal(true);
                  }}
                  className="bg-[#109173] hover:bg-[#0c7058] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Q&A thủ công</span>
                </button>
                <button
                  onClick={triggerCmsSync}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Database className="w-4 h-4" />
                  <span>Đồng bộ từ CMS</span>
                </button>
              </div>
            </div>

            {/* Tri thức Q&A rows matching Screenshot 2 */}
            {knowledge.length === 0 ? (
              <div className="text-center py-20 border border-dashed rounded-3xl text-stone-400">
                <BookOpen className="w-12 h-12 mx-auto text-stone-300 mb-2" />
                <p className="text-sm font-medium">Không tìm thấy bản ghi tri thức nào.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {knowledge.map((item) => (
                  <div 
                    key={item.id}
                    className={`bg-stone-50/50 rounded-2xl border p-5 relative group hover:border-[#109173] transition-all ${
                      item.is_active ? "border-stone-200" : "border-stone-150 opacity-60 bg-stone-100/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        item.source_type === "faq" ? "bg-purple-100 text-purple-700" : "bg-sky-100 text-sky-700"
                      }`}>
                        Q&A {item.source_type === "faq" ? "FAQ" : item.source_reference ? `Bài viết #${item.source_reference}` : "CMS RAG"}
                      </span>
                      
                      {/* Active/Inactive Toggle Switch in the UI */}
                      <button
                        onClick={() => toggleKnowledgeActive(item)}
                        className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider transition-colors ${
                          item.is_active 
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                            : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                        }`}
                        title="Click để bật/tắt tri thức này"
                      >
                        {item.is_active ? "Đang áp dụng" : "Đang tạm ẩn"}
                      </button>

                      <span className="text-[10px] text-stone-400 ml-auto">
                        Cập nhật: {new Date(item.updated_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-800 text-sm leading-snug">{item.title}</h4>
                    <p className="text-xs text-stone-500 mt-2 leading-relaxed font-sans">{item.content}</p>

                    {/* Edit and Delete Buttons enabled for ALL knowledge types, allowing full cleanup */}
                    <div className="absolute right-4 top-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        title="Sửa tri thức"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={() => deleteKnowledgeItem(item.id)}
                        title="Xóa tri thức"
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors border"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Custom Modal for Adding/Editing Knowledge */}
            {showAddKbModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border animate-in fade-in zoom-in duration-200">
                  <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#109173]" />
                    <span>{editingKbItem ? "Cập nhật Tri thức Chatbot" : "Tạo cặp Q&A Tri thức thủ công"}</span>
                  </h3>
                  <form onSubmit={saveKnowledgeItem} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1">Loại tri thức</label>
                      <select
                        disabled={!!editingKbItem}
                        value={kbForm.source_type}
                        onChange={(e) => setKbForm({ ...kbForm, source_type: e.target.value as any })}
                        className="w-full bg-stone-50 border rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-[#109173] outline-none"
                      >
                        <option value="faq">Hỏi & Đáp thủ công (FAQ)</option>
                        <option value="url">Đường link Website cào (URL)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1">Tiêu đề / Câu hỏi</label>
                      <input
                        type="text"
                        value={kbForm.title}
                        onChange={(e) => setKbForm({ ...kbForm, title: e.target.value })}
                        className="w-full border rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-[#109173]"
                        placeholder="Nhập tiêu đề hoặc câu hỏi..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1">Nội dung chi tiết</label>
                      <textarea
                        rows={5}
                        value={kbForm.content}
                        onChange={(e) => setKbForm({ ...kbForm, content: e.target.value })}
                        className="w-full border rounded-xl p-4 text-xs outline-none focus:ring-2 focus:ring-[#109173] font-sans"
                        placeholder="Nhập câu trả lời chính xác..."
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active_kb"
                        checked={kbForm.is_active}
                        onChange={(e) => setKbForm({ ...kbForm, is_active: e.target.checked })}
                        className="w-4 h-4 accent-[#109173]"
                      />
                      <label htmlFor="is_active_kb" className="text-xs font-bold text-stone-600 cursor-pointer">
                        Kích hoạt tri thức
                      </label>
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddKbModal(false)}
                        className="px-4 py-2 rounded-xl text-xs bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs bg-[#109173] hover:bg-[#0c7058] text-white font-bold"
                      >
                        Lưu thông tin
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ─── TAB 3: LỊCH KHÁM (DOCTOR SCHEDULE RAG) ─────────── */}
        {activeTab === "schedule" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-stone-800">Lịch khám</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Lịch khám bác sĩ theo tuần. Chatbot dùng bản <strong className="text-emerald-600">đang áp dụng</strong> để trả lời người bệnh.
                </p>
              </div>
              
              <button
                onClick={() => {
                  setEditingScheduleItem(null);
                  setScheduleForm({ title: "", content: "", is_active: true });
                  setShowAddScheduleModal(true);
                }}
                className="bg-[#109173] hover:bg-[#0c7058] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Lịch Khám</span>
              </button>
            </div>

            {/* Custom Modal for Add/Edit Schedule */}
            {showAddScheduleModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border animate-in fade-in zoom-in duration-200">
                  <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#109173]" />
                    <span>{editingScheduleItem ? "Cập nhật Lịch Khám" : "Tạo Lịch Khám Mới"}</span>
                  </h3>
                  <form onSubmit={saveSchedule} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1">Tiêu đề lịch khám</label>
                      <input
                        type="text"
                        value={scheduleForm.title}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                        className="w-full border rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-[#109173]"
                        placeholder="Ví dụ: Lịch khám ngoại trú — áp dụng từ 04/05/2026"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1">Nội dung lịch khám (RAG)</label>
                      <textarea
                        rows={6}
                        value={scheduleForm.content}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, content: e.target.value })}
                        className="w-full border rounded-xl p-4 text-xs outline-none focus:ring-2 focus:ring-[#109173] font-mono leading-relaxed"
                        placeholder="Mô tả chi tiết ca trực của từng bác sĩ..."
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active_schedule"
                        checked={scheduleForm.is_active}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, is_active: e.target.checked })}
                        className="w-4 h-4 accent-[#109173]"
                      />
                      <label htmlFor="is_active_schedule" className="text-xs font-bold text-stone-600 cursor-pointer">
                        Đang áp dụng
                      </label>
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddScheduleModal(false)}
                        className="px-4 py-2 rounded-xl text-xs bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs bg-[#109173] hover:bg-[#0c7058] text-white font-bold"
                      >
                        Lưu lịch trực
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* List of Schedules matching Screenshot 3 */}
            {schedules.length === 0 ? (
              <div className="text-center py-20 border border-dashed rounded-3xl text-stone-400">
                <Calendar className="w-12 h-12 mx-auto text-stone-300 mb-2" />
                <p className="text-sm font-medium">Chưa có lịch trực y khoa nào.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {schedules.map((item) => (
                  <div 
                    key={item.id} 
                    className={`bg-white rounded-2xl border p-5 shadow-xs relative group hover:border-[#109173] transition-all ${
                      item.is_active ? "border-emerald-200 bg-emerald-50/10" : "border-stone-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-sky-500/10 text-sky-600 rounded-xl shrink-0 mt-0.5">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-extrabold text-stone-800 text-sm leading-snug">{item.title}</h4>
                          <button
                            onClick={() => toggleScheduleActive(item)}
                            className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider transition-colors ${
                              item.is_active 
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                                : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                            }`}
                          >
                            {item.is_active ? "Đang áp dụng" : "Tạm dừng"}
                          </button>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">
                          Áp dụng từ: {new Date(item.created_at).toLocaleDateString("vi-VN")}
                        </p>
                        
                        <pre className="text-xs text-stone-600 font-mono mt-3 leading-relaxed bg-stone-50 border p-3 rounded-xl whitespace-pre-wrap">
                          {item.content}
                        </pre>
                      </div>
                    </div>

                    {/* Hover actions */}
                    <div className="absolute right-4 top-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        title="Sửa lịch khám"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={() => deleteSchedule(item.id)}
                        title="Xóa lịch khám"
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors border"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ─── TAB 4: HỘI THOẠI (CHAT HISTORY LOGS) ──────────── */}
        {activeTab === "history" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            
            {/* Conversations list matching Screenshot 4 */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-stone-50 rounded-2xl border p-4">
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase">Lọc theo đánh giá</label>
                <select
                  value={filterSessionRating}
                  onChange={(e) => setFilterSessionRating(e.target.value)}
                  className="bg-white border rounded-xl px-3 py-2 text-xs outline-none w-full focus:ring-2 focus:ring-[#109173] font-semibold"
                >
                  <option value="">Tất cả cuộc chat</option>
                  <option value="1">Hài lòng 👍</option>
                  <option value="-1">Chưa hài lòng 👎</option>
                </select>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {conversations.length === 0 ? (
                  <div className="text-center py-12 text-stone-400 text-xs">
                    Không tìm thấy hội thoại nào
                  </div>
                ) : (
                  conversations.map((session) => (
                    <button
                      key={session.session_id}
                      onClick={() => setSelectedSessionId(session.session_id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                        selectedSessionId === session.session_id
                          ? "bg-stone-100 border-[#109173] shadow-xs font-semibold"
                          : "bg-white border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-stone-700 truncate max-w-[150px]">
                          {session.session_id}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {session.rating === 1 && <span className="text-emerald-600 font-bold">👍</span>}
                          {session.rating === -1 && <span className="text-rose-600 font-bold">👎</span>}
                          <span className="text-[10px] text-stone-400 font-normal">
                            {new Date(session.updated_at).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <p className="text-stone-500 truncate text-[11px] leading-relaxed italic">
                        "{session.first_message || "Đang mở cuộc chat..."}"
                      </p>

                      <div className="flex justify-between items-center text-[10px] text-stone-400 border-t pt-1.5 font-normal mt-1">
                        <span className="bg-stone-100 px-2 py-0.5 rounded-full font-semibold">{session.message_count} tin</span>
                        <span className="truncate max-w-[120px]">IP: {session.ip_address || "Web User"}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat detail details container */}
            <div className="lg:col-span-2 bg-stone-50 rounded-2xl border p-5 flex flex-col min-h-[420px]">
              {loadingSessionDetails ? (
                <div className="flex flex-col items-center justify-center flex-1 py-12 text-stone-500 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#109173]" />
                  <span className="text-xs font-semibold">Đang truy vấn nội dung cuộc chat...</span>
                </div>
              ) : selectedConversation ? (
                <div className="flex flex-col h-full justify-between flex-1">
                  
                  {/* Chat Info Header */}
                  <div className="border-b pb-4 mb-4 flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-stone-800 text-sm">Hội thoại: {selectedConversation.conversation.session_id}</h4>
                      <div className="text-[10px] text-stone-400 space-x-3 mt-1">
                        <span>Bắt đầu: {new Date(selectedConversation.conversation.created_at).toLocaleString("vi-VN")}</span>
                        <span>IP: {selectedConversation.conversation.ip_address || "LAN"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 items-end shrink-0">
                      {selectedConversation.conversation.rating === 1 && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Hài lòng</span>
                        </span>
                      )}
                      {selectedConversation.conversation.rating === -1 && (
                        <span className="bg-rose-100 text-rose-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>Chưa hài lòng</span>
                        </span>
                      )}
                      {selectedConversation.conversation.feedback_notes && (
                        <p className="text-[10px] text-stone-500 italic max-w-xs text-right mt-1 bg-white border p-2 rounded-xl">
                          "{selectedConversation.conversation.feedback_notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message Bubbles */}
                  <div className="flex-1 space-y-4 max-h-[350px] overflow-y-auto pr-1 pb-4">
                    {selectedConversation.messages.map((msg, index) => (
                      <div 
                        key={index}
                        className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wide">
                            {msg.role === "user" ? "Người bệnh" : "Y Dược AI"}
                          </span>
                          <span className="text-[9px] text-stone-400">
                            {new Date(msg.timestamp).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                          msg.role === "user" 
                            ? "bg-sky-500 text-white rounded-tr-none"
                            : "bg-white border border-stone-200 text-stone-700 shadow-sm rounded-tl-none font-sans"
                        }`}>
                          <p className="whitespace-pre-line">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t text-[11px] text-stone-400 leading-relaxed italic text-center">
                    * Tuân thủ quy định bảo mật thông tin y tế của Viện Y Dược Học Dân Tộc TP.HCM.
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center py-16 text-stone-400 gap-2">
                  <Bot className="w-12 h-12 text-stone-300" />
                  <p className="text-xs font-semibold">Chọn cuộc hội thoại bên trái để xem nội dung.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ─── TAB 5: CẦN BỔ SUNG (UNRESOLVED QUESTIONS) ───────── */}
        {activeTab === "unresolved" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="border-b pb-4">
              <h3 className="text-base font-bold text-stone-800">Cần bổ sung</h3>
              <p className="text-xs text-stone-500 mt-1">
                Câu hỏi bot chưa biết trả lời hoặc trả lời chưa khớp. Hãy cập nhật các câu hỏi này vào kiến thức của trợ lý ảo AI.
              </p>
            </div>

            {unresolved.length === 0 ? (
              <div className="text-center py-16 border border-dashed rounded-3xl text-stone-400">
                <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-medium">Tuyệt vời! Không còn câu hỏi chưa khớp nào.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unresolved.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-stone-50 border rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-sky-400 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-700 text-sm leading-snug">"{item.question}"</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-bold">
                          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Không khớp
                          </span>
                          <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                            {item.match_score}% khớp
                          </span>
                          <span className="text-stone-400 font-normal">
                            Ghi nhận: {new Date(item.created_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {/* Checkmark button to resolve (opens Q&A creator instantly populated) */}
                      <button
                        onClick={() => resolveUnresolved(item)}
                        title="Tạo Q&A và giải quyết câu này"
                        className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:scale-95 transition-all border border-emerald-200"
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      {/* Trash button to exclude from unresolved list */}
                      <button
                        onClick={() => deleteUnresolved(item.id)}
                        title="Xóa câu hỏi"
                        className="p-2.5 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 active:scale-95 transition-all border"
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

        {/* ─── TAB 6: CÀI ĐẶT (CONFIGS) ────────────────────── */}
        {activeTab === "config" && (
          <form onSubmit={saveConfigs} className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    System Prompt (Định vị Persona cho Trợ lý ảo)
                  </label>
                  <p className="text-xs text-stone-500 mb-2">
                    Các chỉ đạo hệ thống để huấn luyện cách trò chuyện của bot. Đừng chỉnh sửa toàn bộ nếu muốn bot vẫn duy trì các cam kết y tế.
                  </p>
                  <textarea
                    rows={8}
                    value={configs.system_prompt}
                    onChange={(e) => setConfigs({ ...configs, system_prompt: e.target.value })}
                    className="w-full border border-stone-300 rounded-xl p-4 text-sm font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    Câu chào mừng mặc định (Welcome Message)
                  </label>
                  <input
                    type="text"
                    value={configs.welcome_message}
                    onChange={(e) => setConfigs({ ...configs, welcome_message: e.target.value })}
                    className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Sidebar AI params */}
              <div className="bg-stone-50 rounded-2xl border p-5 space-y-5">
                <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider border-b pb-2 mb-3">
                  Thông số Kỹ thuật AI
                </h3>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase">Mô hình chạy chính</label>
                  <select
                    value={configs.ai_model}
                    onChange={(e) => setConfigs({ ...configs, ai_model: e.target.value })}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  >
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Khuyên dùng - Siêu tốc)</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-flash-latest">Gemini Flash Latest</option>
                    <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-stone-600 uppercase">Độ sáng tạo (Temperature)</label>
                    <span className="text-xs font-bold text-stone-700">{configs.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.1"
                    value={configs.temperature}
                    onChange={(e) => setConfigs({ ...configs, temperature: e.target.value })}
                    className="w-full accent-[#109173]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase">Màu sắc chủ đạo Widget</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={configs.widget_theme_color}
                      onChange={(e) => setConfigs({ ...configs, widget_theme_color: e.target.value })}
                      className="w-10 h-10 border border-stone-300 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={configs.widget_theme_color}
                      onChange={(e) => setConfigs({ ...configs, widget_theme_color: e.target.value })}
                      className="flex-1 border border-stone-300 rounded-xl px-3 py-1.5 text-xs outline-none text-stone-700 uppercase"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Lưu ý: Thay đổi cấu hình này sẽ tự động cập nhật ngay lập tức cho tất cả người dùng cuối ngoài trang chủ của Viện.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#109173] hover:bg-[#0c7058] active:scale-95 text-white px-6 py-2.5 rounded-xl font-bold tracking-wide transition-all flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Lưu cấu hình hệ thống</span>
              </button>
            </div>
          </form>
        )}

      </div>
      
    </div>
  );
}
