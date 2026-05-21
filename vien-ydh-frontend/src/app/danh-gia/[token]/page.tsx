"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Star, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function parseToken(token: string): { appointmentId: string; doctorId: string } | null {
  try {
    const decoded = atob(token.replace(/-/g, "+").replace(/_/g, "/"));
    const [appointmentId, doctorId] = decoded.split("|");
    if (!appointmentId || !doctorId) return null;
    return { appointmentId, doctorId };
  } catch {
    return null;
  }
}

const LABELS = ["", "Rất không hài lòng", "Không hài lòng", "Bình thường", "Hài lòng", "Rất hài lòng"];

export default function DanhGiaPage() {
  const params = useParams();
  const rawToken = typeof params.token === "string" ? params.token : Array.isArray(params.token) ? params.token[0] : "";
  const parsed = parseToken(rawToken);

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error" | "invalid">(
    parsed ? "idle" : "invalid"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit() {
    if (!parsed || rating === 0) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: parsed.doctorId,
          appointment_id: parsed.appointmentId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else if (res.status === 409) {
        setErrorMsg("Lịch hẹn này đã được đánh giá trước đó.");
        setStatus("error");
      } else {
        setErrorMsg(data.error || "Đã có lỗi xảy ra.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Không thể kết nối máy chủ. Vui lòng thử lại.");
      setStatus("error");
    }
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 max-w-sm w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-stone-800 mb-2">Liên kết không hợp lệ</h1>
          <p className="text-stone-500 text-sm">Liên kết đánh giá này không đúng hoặc đã hết hạn.</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 max-w-sm w-full text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-stone-800 mb-2">Cảm ơn bạn!</h1>
          <p className="text-stone-500 text-sm">Đánh giá của bạn đã được ghi nhận và sẽ hiển thị sau khi được duyệt.</p>
          <div className="flex justify-center gap-1 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-6 h-6 ${i < rating ? "fill-amber-400 text-amber-400" : "text-stone-200"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
            <Star className="w-7 h-7 text-primary-600" />
          </div>
          <h1 className="text-lg font-bold text-stone-800">Đánh giá bác sĩ</h1>
          <p className="text-stone-500 text-sm mt-1">Chia sẻ trải nghiệm để giúp cải thiện dịch vụ</p>
        </div>

        <div className="flex justify-center gap-2 mb-2">
          {Array.from({ length: 5 }).map((_, i) => {
            const val = i + 1;
            return (
              <button
                key={i}
                onClick={() => setRating(val)}
                onMouseEnter={() => setHovered(val)}
                onMouseLeave={() => setHovered(0)}
                className="focus:outline-none transition-transform hover:scale-110"
                aria-label={`${val} sao`}
              >
                <Star className={`w-10 h-10 transition-colors ${val <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "text-stone-200"}`} />
              </button>
            );
          })}
        </div>
        {rating > 0 ? (
          <p className="text-center text-sm font-medium text-amber-600 mb-4">{LABELS[rating]}</p>
        ) : (
          <div className="mb-4" />
        )}

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Nhận xét thêm (không bắt buộc)..."
          maxLength={500}
          rows={3}
          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 text-stone-700 placeholder:text-stone-300 mb-4"
        />

        {status === "error" && (
          <p className="text-red-500 text-sm mb-3 text-center">{errorMsg}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || status === "submitting"}
          className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {status === "submitting" ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Đang gửi...</>
          ) : "Gửi đánh giá"}
        </button>
      </div>
    </div>
  );
}
