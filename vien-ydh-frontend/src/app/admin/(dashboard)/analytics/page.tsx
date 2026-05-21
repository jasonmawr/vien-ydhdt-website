"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  BarChart2, Eye, Calendar, FileText,
  TrendingUp, RefreshCw,
} from "lucide-react";
import { getAuthToken } from "@/services/auth";

const API = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

interface PostStats { id: number; title: string; view_count: number; status: string; created_at: string; }

export default function AdminAnalyticsPage() {
  const [posts, setPosts] = useState<PostStats[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [mediaStats, setMediaStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const token = await getAuthToken() || "";
      const headers = { Authorization: `Bearer ${token}` };
      const safeFetch = (url: string) =>
        fetch(url, { headers })
          .then(r => r.ok ? r.json() : { success: false })
          .catch(() => ({ success: false }));

      const [p, a, m] = await Promise.all([
        safeFetch(`${API}/api/cms/posts?limit=100`),
        safeFetch(`${API}/api/appointments?limit=200`),
        safeFetch(`${API}/api/upload/stats`),
      ]);
      if (p.success) setPosts(p.data || []);
      if (a.success) setAppointments(a.data || []);
      if (m.success) setMediaStats(m.data);
      setLoading(false);
    }
    loadData();
  }, []);

  const totalViews = posts.reduce((sum, p) => sum + (p.view_count || 0), 0);
  const publishedPosts = posts.filter(p => p.status === "published").length;
  const topPosts = [...posts].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 10);

  // Appointments by date (last 14 days for chart)
  const now = new Date();
  const last30 = appointments.filter(a => {
    if (!a[12]) return true;
    return new Date(a[12]).getTime() > now.getTime() - 30 * 24 * 60 * 60 * 1000;
  });

  // Build daily appointments chart data (last 14 days)
  const apptChartData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    const dateStr = d.toISOString().split("T")[0];
    const count = appointments.filter(a => {
      const created = (a[12] || a.CREATED_AT || "").toString().slice(0, 10);
      return created === dateStr;
    }).length;
    return { date: label, "Lịch hẹn": count };
  });

  // Post status pie chart
  const statusPieData = [
    { name: "Đã xuất bản", value: posts.filter(p => p.status === "published").length, color: "#10b981" },
    { name: "Nháp", value: posts.filter(p => p.status === "draft").length, color: "#f59e0b" },
    { name: "Đã lên lịch", value: posts.filter(p => p.status === "scheduled").length, color: "#3b82f6" },
  ].filter(s => s.value > 0);

  // Top posts bar chart data
  const topPostsChartData = topPosts.slice(0, 8).map(p => ({
    name: p.title.length > 24 ? p.title.slice(0, 24) + "…" : p.title,
    "Lượt xem": p.view_count || 0,
  }));

  const statCards = [
    { label: "Tổng lượt xem", value: totalViews.toLocaleString(), icon: <Eye className="w-5 h-5" />, color: "text-blue-600 bg-blue-50" },
    { label: "Lịch hẹn", value: appointments.length.toLocaleString(), icon: <Calendar className="w-5 h-5" />, color: "text-emerald-600 bg-emerald-50" },
    { label: "Bài viết đã xuất bản", value: publishedPosts.toString(), icon: <FileText className="w-5 h-5" />, color: "text-amber-600 bg-amber-50" },
    { label: "File đã tải lên", value: (mediaStats?.totalFiles || 0).toString(), icon: <BarChart2 className="w-5 h-5" />, color: "text-purple-600 bg-purple-50" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <RefreshCw className="w-8 h-8 animate-spin text-[#109173]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Thống kê & Analytics</h1>
        <p className="text-stone-500 text-sm mt-1">Tổng quan hoạt động hệ thống</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl p-5 border border-stone-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              {card.icon}
            </div>
            <div className="text-2xl font-bold text-stone-800">{card.value}</div>
            <div className="text-stone-500 text-sm mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Appointments Trend Chart */}
      <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#109173]" />
          Lịch hẹn 14 ngày gần đây
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={apptChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ee" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#78716c" }} />
            <YAxis tick={{ fontSize: 11, fill: "#78716c" }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e7e5e4" }} />
            <Line type="monotone" dataKey="Lịch hẹn" stroke="#109173" strokeWidth={2} dot={{ r: 3, fill: "#109173" }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Posts Bar Chart */}
        <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-sm">
          <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#109173]" />
            Top bài viết được đọc nhiều
          </h2>
          {topPostsChartData.length === 0 ? (
            <p className="text-stone-400 text-sm">Chưa có dữ liệu</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topPostsChartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f0ee" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#78716c" }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fill: "#78716c" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e7e5e4" }} />
                <Bar dataKey="Lượt xem" fill="#109173" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Post Status Pie Chart */}
        <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-sm">
          <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#109173]" />
            Trạng thái bài viết
          </h2>
          {statusPieData.length === 0 ? (
            <p className="text-stone-400 text-sm">Chưa có bài viết</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {statusPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e7e5e4" }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { label: "Đã xuất bản", count: posts.filter(p => p.status === "published").length, color: "text-emerald-700 bg-emerald-50" },
                  { label: "Nháp", count: posts.filter(p => p.status === "draft").length, color: "text-amber-700 bg-amber-50" },
                  { label: "Đã lên lịch", count: posts.filter(p => p.status === "scheduled").length, color: "text-blue-700 bg-blue-50" },
                ].map(s => (
                  <div key={s.label} className={`rounded-lg p-3 text-center ${s.color}`}>
                    <div className="text-xl font-bold">{s.count}</div>
                    <div className="text-xs mt-0.5 font-medium opacity-80">{s.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-sm">
          <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#109173]" />
            Lịch hẹn gần đây ({last30.length} trong 30 ngày)
          </h2>
          {appointments.length === 0 ? (
            <p className="text-stone-400 text-sm">Chưa có lịch hẹn</p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 8).map((appt: any, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-stone-700">{appt[1] || appt.PATIENT_NAME || "Bệnh nhân"}</p>
                    <p className="text-stone-400 text-xs">{appt[4] || appt.APPOINTMENT_DATE || "—"}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    {(appt[8] || appt.STATUS || "PENDING").toString().toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media Stats */}
        {mediaStats ? (
          <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-sm">
            <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#109173]" />
              Dung lượng lưu trữ
            </h2>
            <div className="space-y-3">
              {Object.entries(mediaStats.byType || {}).map(([type, info]: [string, any]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-sm text-stone-600 capitalize w-16">{type}</span>
                  <div className="flex-1 bg-stone-100 rounded-full h-2">
                    <div
                      className="bg-[#109173] h-2 rounded-full"
                      style={{ width: `${Math.min(100, (info.size / (mediaStats.totalSize || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-stone-500 w-20 text-right">
                    {info.count} file · {(info.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              ))}
            </div>
            <p className="text-stone-400 text-xs mt-4">Tổng: {mediaStats.totalSizeMb} MB</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-sm flex items-center justify-center">
            <p className="text-stone-400 text-sm">Không có dữ liệu lưu trữ</p>
          </div>
        )}
      </div>
    </div>
  );
}
