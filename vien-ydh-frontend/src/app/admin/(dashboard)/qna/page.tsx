"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  HelpCircle, MessageSquare, Search, Filter, 
  Trash2, Send, Save, CheckCircle, AlertCircle, X,
  Clock, Check, User, Phone, Mail, Award, BookOpen, Globe2, EyeOff, RefreshCw
} from "lucide-react";
import { getAuthToken } from "@/services/auth";

const API = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

interface QnaItem {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  is_answered: number;
  answer: string | null;
  answered_by: string | null;
  answered_at: string | null;
  is_public: number;
  created_at: string;
}

export default function QnaAdminPage() {
  const tokenRef = useRef<string>("");

  // Common Loading & Notifications State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data States
  const [qnas, setQnas] = useState<QnaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterAnswered, setFilterAnswered] = useState("");
  const [filterPublic, setFilterPublic] = useState("");

  // Modal / Review States
  const [selectedQna, setSelectedQna] = useState<QnaItem | null>(null);
  const [answerForm, setAnswerForm] = useState({
    answer: "",
    answered_by: "",
    is_public: false
  });
  const [showAnswerModal, setShowAnswerModal] = useState(false);

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

  // Fetch Q&As
  const loadQnas = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/qna/admin";
      const params = [];
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (filterSubject) params.push(`subject=${encodeURIComponent(filterSubject)}`);
      if (filterAnswered) params.push(`is_answered=${filterAnswered}`);
      if (filterPublic) params.push(`is_public=${filterPublic}`);
      
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const res = await apiFetch(url);
      if (res.ok) {
        const json = await res.json();
        setQnas(json.data || []);
      } else {
        setErrorMessage("Lỗi tải danh sách Hỏi & Đáp y khoa.");
      }
    } catch (err) {
      setErrorMessage("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch, searchQuery, filterSubject, filterAnswered, filterPublic]);

  // Trigger search loading
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadQnas();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, filterSubject, filterAnswered, filterPublic, loadQnas]);

  // Answer Q&A submit handler
  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQna) return;
    setLoading(true);

    try {
      const res = await apiFetch(`/api/qna/admin/${selectedQna.id}`, {
        method: "PUT",
        body: JSON.stringify({
          answer: answerForm.answer,
          answered_by: answerForm.answered_by,
          is_public: answerForm.is_public
        })
      });

      if (res.ok) {
        showToast("Đã duyệt và lưu câu trả lời Hỏi & Đáp thành công!");
        setShowAnswerModal(false);
        setSelectedQna(null);
        setAnswerForm({ answer: "", answered_by: "", is_public: false });
        loadQnas();
      } else {
        const data = await res.json();
        showToast(data.error || "Không thể cập nhật câu trả lời.", false);
      }
    } catch (err) {
      showToast("Lỗi kết nối máy chủ.", false);
    } finally {
      setLoading(false);
    }
  };

  // Delete Q&A handler
  const handleDeleteQna = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi của bệnh nhân này vĩnh viễn khỏi cơ sở dữ liệu?")) return;
    setLoading(true);

    try {
      const res = await apiFetch(`/api/qna/admin/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        showToast("Đã xóa câu hỏi của bệnh nhân thành công.");
        loadQnas();
      } else {
        showToast("Không thể xóa câu hỏi.", false);
      }
    } catch (err) {
      showToast("Lỗi kết nối.", false);
    } finally {
      setLoading(false);
    }
  };

  // Quick action to open modal
  const openAnswerForm = (qna: QnaItem) => {
    setSelectedQna(qna);
    setAnswerForm({
      answer: qna.answer || "",
      answered_by: qna.answered_by || "",
      is_public: qna.is_public === 1
    });
    setShowAnswerModal(true);
  };

  // Summary Metrics calculations
  const totalCount = qnas.length;
  const unansweredCount = qnas.filter(q => q.is_answered === 0).length;
  const answeredCount = qnas.filter(q => q.is_answered === 1).length;
  const publicCount = qnas.filter(q => q.is_public === 1).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Toast notifications */}
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
      <div className="bg-gradient-to-r from-primary-950 to-primary-850 rounded-3xl p-7 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-6">
          <HelpCircle className="w-80 h-80" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-8 h-8 text-sky-400" />
              <span className="bg-sky-500/20 text-sky-300 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Q&A PORTAL · LIVE
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2">Duyệt Hỏi Đáp Y Khoa (Q&A)</h1>
            <p className="text-primary-200 text-sm mt-1 max-w-xl">
              Không gian điều phối thông tin y khoa: tiếp nhận câu hỏi sức khỏe trực tuyến từ bệnh nhân, phản hồi chuyên khoa chính xác và duyệt đăng tin công khai.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { loadQnas(); showToast("Đã làm mới dữ liệu!"); }}
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/10 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">Tổng Câu Hỏi</p>
            <p className="text-2xl font-black text-stone-700 mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-amber-500 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">Chưa Trả Lời</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{unansweredCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Check className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">Đã Phản Hồi</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{answeredCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
            <Globe2 className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">Đang Công Khai</p>
            <p className="text-2xl font-black text-sky-600 mt-0.5">{publicCount}</p>
          </div>
        </div>

      </div>

      {/* Filters and search panel */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
        
        <div className="flex flex-col lg:flex-row gap-3">
          
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên, Số điện thoại, Nội dung câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-[#109173] text-stone-850"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 shrink-0">
            
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-stone-50 border rounded-xl px-3 py-2.5 text-xs font-bold text-stone-600 outline-none cursor-pointer"
            >
              <option value="">-- Tất cả chủ đề --</option>
              <option value="Đặt lịch khám">Đặt lịch khám</option>
              <option value="Hỏi về dịch vụ">Hỏi về dịch vụ</option>
              <option value="Tra cứu kết quả khám">Tra cứu kết quả khám</option>
              <option value="Góp ý chất lượng dịch vụ">Góp ý chất lượng dịch vụ</option>
              <option value="Khác">Khác</option>
            </select>

            <select
              value={filterAnswered}
              onChange={(e) => setFilterAnswered(e.target.value)}
              className="bg-stone-50 border rounded-xl px-3 py-2.5 text-xs font-bold text-stone-600 outline-none cursor-pointer"
            >
              <option value="">-- Trạng thái duyệt --</option>
              <option value="0">Chưa trả lời</option>
              <option value="1">Đã trả lời</option>
            </select>

            <select
              value={filterPublic}
              onChange={(e) => setFilterPublic(e.target.value)}
              className="bg-stone-50 border rounded-xl px-3 py-2.5 text-xs font-bold text-stone-600 outline-none cursor-pointer col-span-2 md:col-span-1"
            >
              <option value="">-- Trạng thái hiển thị --</option>
              <option value="1">Đang công khai</option>
              <option value="0">Chỉ xem nội bộ</option>
            </select>

          </div>

        </div>

        {/* Q&A Cards List */}
        <div className="space-y-4 pt-2">
          {loading && qnas.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-20 text-stone-500 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#109173]" />
              <p className="text-xs font-semibold">Đang liên kết dữ liệu y khoa từ SQLite...</p>
            </div>
          ) : qnas.length === 0 ? (
            <div className="border border-dashed rounded-2xl py-16 text-center text-stone-400 flex flex-col justify-center items-center gap-2">
              <HelpCircle className="w-10 h-10 opacity-30" />
              <p className="text-sm font-semibold">Không tìm thấy câu hỏi Hỏi & Đáp nào phù hợp</p>
              <p className="text-xs text-stone-400">Người bệnh gửi câu hỏi ngoài trang chủ sẽ hiển thị ngay tại đây.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {qnas.map((item) => (
                <div 
                  key={item.id}
                  className="bg-stone-50/50 hover:bg-stone-50 rounded-2xl border border-stone-200 p-5 transition-all shadow-xs flex flex-col md:flex-row justify-between gap-5 relative overflow-hidden"
                >
                  {/* Left info column */}
                  <div className="space-y-3.5 flex-1">
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-primary-100 text-primary-800 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                        {item.subject}
                      </span>
                      <span className="text-[10px] text-stone-400 font-bold">
                        {new Date(item.created_at).toLocaleString("vi-VN")}
                      </span>
                      
                      {item.is_answered === 1 ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Đã phản hồi
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[9px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Chờ trả lời
                        </span>
                      )}

                      {item.is_public === 1 && (
                        <span className="bg-sky-100 text-sky-800 text-[9px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Globe2 className="w-3 h-3" /> Công khai
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-extrabold text-stone-400 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-primary-600" /> CÂU HỎI CỦA NGƯỜI BỆNH:
                      </p>
                      <h3 className="text-sm font-bold text-stone-700 leading-relaxed bg-white border border-stone-200 p-3.5 rounded-xl">
                        "{item.message}"
                      </h3>
                    </div>

                    {item.is_answered === 1 && item.answer && (
                      <div className="space-y-1.5 pl-4 border-l-2 border-emerald-400 bg-emerald-50/20 p-3 rounded-xl">
                        <p className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> BÁC SĨ PHẢN HỒI ({item.answered_by}):
                        </p>
                        <p className="text-xs text-stone-600 leading-relaxed font-semibold italic">
                          "{item.answer}"
                        </p>
                        {item.answered_at && (
                          <p className="text-[9px] text-stone-400 font-bold mt-1">
                            Duyệt phản hồi lúc: {new Date(item.answered_at).toLocaleString("vi-VN")}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Patient identity bar */}
                    <div className="flex flex-wrap items-center gap-4 bg-white/60 border border-stone-200/50 p-2.5 rounded-xl text-[10px] text-stone-500 font-bold">
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-stone-400" /> Bệnh nhân: <strong className="text-stone-750 font-bold">{item.name}</strong></span>
                      <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-stone-400" /> SĐT: <strong className="text-stone-750 font-bold">{item.phone}</strong></span>
                      {item.email && (
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-stone-400" /> Email: <strong className="text-stone-750 font-bold">{item.email}</strong></span>
                      )}
                    </div>

                  </div>

                  {/* Right actions column */}
                  <div className="flex md:flex-col items-end md:justify-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-stone-200 pt-4 md:pt-0 md:pl-5">
                    
                    <button
                      onClick={() => openAnswerForm(item)}
                      className="bg-primary-600 hover:bg-primary-700 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Send className="w-3 h-3" />
                      <span>{item.is_answered === 1 ? "Sửa phản hồi" : "Trả lời"}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteQna(item.id)}
                      className="bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-600 p-2.5 rounded-xl border border-stone-200 hover:border-rose-200 transition-colors"
                      title="Xóa câu hỏi khỏi CSDL"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Review & Answer Modal Dialog */}
      {showAnswerModal && selectedQna && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          
          <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-950 to-primary-900 px-6 py-4.5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-400" />
                <span className="font-extrabold text-sm tracking-wide">Duyệt & Trả Lời Câu Hỏi Y Khoa</span>
              </div>
              <button 
                onClick={() => { setShowAnswerModal(false); setSelectedQna(null); }}
                className="text-stone-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAnswerSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              
              {/* Patient info details */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 text-stone-500 font-bold">
                  <div>Tên bệnh nhân: <strong className="text-stone-700 block mt-0.5">{selectedQna.name}</strong></div>
                  <div>Số điện thoại: <strong className="text-stone-700 block mt-0.5">{selectedQna.phone}</strong></div>
                  <div className="col-span-2">Chủ đề câu hỏi: <strong className="text-primary-700 block mt-0.5 uppercase tracking-wider">{selectedQna.subject}</strong></div>
                </div>
              </div>

              {/* Patient Question display */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Nội dung câu hỏi:</label>
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl text-xs font-semibold text-stone-700 leading-relaxed italic">
                  "{selectedQna.message}"
                </div>
              </div>

              {/* Answer Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Nội dung trả lời của Bác sĩ: *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Nhập câu trả lời chi tiết, lịch sự, chuẩn y khoa từ bác sĩ..."
                  value={answerForm.answer}
                  onChange={(e) => setAnswerForm({ ...answerForm, answer: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs font-semibold leading-relaxed focus:bg-white focus:ring-2 focus:ring-[#109173] outline-none text-stone-800"
                />
              </div>

              {/* Answered By Doctor Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Bác sĩ phản hồi / Bộ phận trả lời: *</label>
                <div className="relative">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    required
                    type="text"
                    placeholder="Ví dụ: BS. Đỗ Tấn Khoa, Ban biên tập Y khoa..."
                    value={answerForm.answered_by}
                    onChange={(e) => setAnswerForm({ ...answerForm, answered_by: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#109173] outline-none text-stone-800"
                  />
                </div>
              </div>

              {/* Toggle Public Checkbox Option */}
              <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <Globe2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-extrabold text-sky-950">Công khai lên FAQ Trang chủ</p>
                    <p className="text-sky-800 font-medium mt-0.5">Duyệt câu hỏi này xuất hiện trên trang Hỏi & Đáp để các bệnh nhân khác cùng tra cứu.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={answerForm.is_public}
                  onChange={(e) => setAnswerForm({ ...answerForm, is_public: e.target.checked })}
                  className="w-5 h-5 rounded border-stone-300 text-sky-600 focus:ring-sky-500 shrink-0 cursor-pointer"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex gap-2 pt-2 border-t justify-end">
                <button
                  type="button"
                  onClick={() => { setShowAnswerModal(false); setSelectedQna(null); }}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-600 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary-600 hover:bg-primary-700 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Duyệt & Lưu phản hồi</span>
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}
