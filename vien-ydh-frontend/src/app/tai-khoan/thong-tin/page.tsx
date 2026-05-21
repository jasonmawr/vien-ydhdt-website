"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Save, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

const API = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

export default function PatientProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: "", dob: "", gender: "", email: "", phone: "" });

  useEffect(() => {
    const token = localStorage.getItem("patient_token");
    if (!token) { router.replace("/tai-khoan/dang-nhap"); return; }
    fetch(`${API}/api/patient/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const p = data.data;
          setForm({
            fullName: p.full_name || "",
            dob: p.dob || "",
            gender: p.gender || "",
            email: p.email || "",
            phone: p.phone || "",
          });
        }
      })
      .catch(() => toast.error("Không tải được thông tin"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("patient_token");
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/patient/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        // Cập nhật patient_info trong localStorage
        const info = JSON.parse(localStorage.getItem("patient_info") || "{}");
        localStorage.setItem("patient_info", JSON.stringify({ ...info, fullName: form.fullName }));
        toast.success("Đã cập nhật thông tin thành công");
      } else {
        toast.error(data.error || "Lỗi lưu thông tin");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#109173]" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href="/tai-khoan/lich-hen" className="flex items-center gap-1 text-stone-500 hover:text-stone-700 text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại lịch hẹn
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#109173] p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Thông tin cá nhân</h1>
              <p className="text-white/70 text-sm">{form.phone}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Họ và tên</label>
            <input
              type="text"
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#109173] text-stone-800"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="email@gmail.com"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#109173] text-stone-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Ngày sinh</label>
              <input
                type="date"
                value={form.dob}
                onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#109173] text-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Giới tính</label>
              <select
                value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#109173] text-stone-800 bg-white"
              >
                <option value="">-- Chọn --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#109173] hover:bg-[#0d7a61] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu thông tin
          </button>
        </form>
      </div>
    </div>
  );
}
