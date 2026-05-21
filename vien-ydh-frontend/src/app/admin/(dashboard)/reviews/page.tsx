"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Star, CheckCircle, XCircle, Trash2, RefreshCw, Filter } from "lucide-react";
import { getAuthToken } from "@/services/auth";

const API = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

interface Review {
  id: number;
  doctor_id: string;
  appointment_id: string | null;
  rating: number;
  comment: string | null;
  patient_phone: string | null;
  is_published: number;
  created_at: string;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-stone-200"}`}
        />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "published">("all");
  const tokenRef = useRef<string>("");

  // Fetch token once on mount
  useEffect(() => {
    getAuthToken().then(t => { tokenRef.current = t || ""; });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    if (!tokenRef.current) {
      tokenRef.current = await getAuthToken() || "";
    }
    const url = filter === "all"
      ? `${API}/api/reviews`
      : `${API}/api/reviews?status=${filter}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${tokenRef.current}` },
    }).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      setReviews(data.data || []);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function approve(id: number, publish: boolean) {
    await fetch(`${API}/api/reviews/${id}/approve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tokenRef.current}`, "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: publish }),
    });
    load();
  }

  async function remove(id: number) {
    if (!confirm("Xóa đánh giá này?")) return;
    await fetch(`${API}/api/reviews/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenRef.current}` },
    });
    load();
  }

  const pending = reviews.filter(r => !r.is_published).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Đánh giá bác sĩ</h1>
          <p className="text-stone-500 text-sm mt-1">
            {pending > 0 ? (
              <span className="text-amber-600 font-medium">{pending} đánh giá chờ duyệt</span>
            ) : "Tất cả đánh giá đã được xử lý"}
          </p>
        </div>
        <button onClick={load} className="p-2 rounded-lg hover:bg-stone-100 transition-colors">
          <RefreshCw className={`w-5 h-5 text-stone-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "published"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-[#109173] text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {f === "all" ? "Tất cả" : f === "pending" ? "Chờ duyệt" : "Đã duyệt"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-[#109173]" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-stone-400">Không có đánh giá nào</div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div
              key={r.id}
              className={`bg-white rounded-xl border p-5 shadow-sm ${
                r.is_published ? "border-stone-100" : "border-amber-200 bg-amber-50/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <StarRow rating={r.rating} />
                    <span className="text-xs text-stone-400">
                      {new Date(r.created_at).toLocaleDateString("vi-VN")}
                    </span>
                    {!r.is_published && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        Chờ duyệt
                      </span>
                    )}
                    {r.is_published === 1 && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        Đã duyệt
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-400 mb-1">
                    Bác sĩ: <span className="text-stone-600 font-medium">{r.doctor_id}</span>
                    {r.patient_phone && <> · SĐT: {r.patient_phone}</>}
                    {r.appointment_id && <> · Mã hẹn: {r.appointment_id}</>}
                  </div>
                  {r.comment ? (
                    <p className="text-sm text-stone-700 mt-1">{r.comment}</p>
                  ) : (
                    <p className="text-sm text-stone-400 italic mt-1">Không có nhận xét</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {!r.is_published ? (
                    <button
                      onClick={() => approve(r.id, true)}
                      title="Duyệt"
                      className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => approve(r.id, false)}
                      title="Bỏ duyệt"
                      className="p-2 rounded-lg bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => remove(r.id)}
                    title="Xóa"
                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
