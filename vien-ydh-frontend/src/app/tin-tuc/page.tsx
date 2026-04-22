"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Clock, Tag, ArrowRight, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

const categories = ["Tất cả", "Y học cổ truyền", "Sức khỏe & Dinh dưỡng", "Hoạt động Viện", "Nghiên cứu khoa học", "Hướng dẫn bệnh nhân"];

const newsArticles = [
  {
    id: 1,
    category: "Y học cổ truyền",
    title: "Châm cứu điều trị thoái hóa cột sống cổ — Hiệu quả và An toàn",
    excerpt: "Nghiên cứu mới nhất của Viện Y Dược Học Dân Tộc chứng minh phương pháp châm cứu kết hợp xoa bóp cho hiệu quả điều trị thoái hóa cột sống cổ lên đến 87%...",
    date: "18/04/2026",
    readTime: "5 phút",
    tag: "Hot",
    imageGradient: "from-primary-400 to-teal-500",
  },
  {
    id: 2,
    category: "Hoạt động Viện",
    title: "Viện Y Dược Học Dân Tộc triển khai Cổng Đặt Lịch Khám Trực Tuyến",
    excerpt: "Chính thức ra mắt hệ thống đặt lịch khám online tích hợp thanh toán điện tử VietQR, giúp bệnh nhân thuận tiện hơn trong việc tiếp cận dịch vụ y tế...",
    date: "15/04/2026",
    readTime: "3 phút",
    tag: "Mới",
    imageGradient: "from-blue-400 to-primary-500",
  },
  {
    id: 3,
    category: "Sức khỏe & Dinh dưỡng",
    title: "Thực phẩm tốt cho người bị đau khớp theo Y học cổ truyền",
    excerpt: "Chế độ dinh dưỡng đóng vai trò quan trọng trong điều trị bệnh xương khớp. Theo YHCT, một số thực phẩm như nghệ, gừng, tỏi... có tác dụng chống viêm tự nhiên...",
    date: "10/04/2026",
    readTime: "7 phút",
    tag: "",
    imageGradient: "from-amber-400 to-orange-500",
  },
  {
    id: 4,
    category: "Nghiên cứu khoa học",
    title: "Nghiên cứu tác dụng bài thuốc \"Độc Hoạt Ký Sinh Thang\" trong điều trị thoái hóa khớp gối",
    excerpt: "Đề tài nghiên cứu cấp Bộ Y tế do GS.TS Nguyễn Văn An chủ trì đã chứng minh bài thuốc cổ phương này có hiệu quả vượt trội so với placebo qua thử nghiệm lâm sàng...",
    date: "05/04/2026",
    readTime: "10 phút",
    tag: "",
    imageGradient: "from-purple-400 to-pink-500",
  },
  {
    id: 5,
    category: "Hướng dẫn bệnh nhân",
    title: "Hướng dẫn chuẩn bị trước khi đến khám tại Viện Y Dược Học Dân Tộc",
    excerpt: "Để buổi khám diễn ra nhanh chóng và hiệu quả, bệnh nhân cần chuẩn bị đầy đủ giấy tờ, tránh ăn 30 phút trước khi đến...",
    date: "01/04/2026",
    readTime: "4 phút",
    tag: "",
    imageGradient: "from-teal-400 to-cyan-500",
  },
  {
    id: 6,
    category: "Y học cổ truyền",
    title: "Bí quyết dưỡng sinh mùa hè theo Y học cổ truyền",
    excerpt: "Mùa hè nóng bức là thời điểm cơ thể dễ bị \"Thử nhiệt\". Các bài tập khí công, thực phẩm thanh mát và phác đồ châm cứu dưỡng sinh giúp cơ thể cân bằng...",
    date: "28/03/2026",
    readTime: "6 phút",
    tag: "",
    imageGradient: "from-green-400 to-teal-500",
  },
];

export default function TinTucPage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");

  const filtered = newsArticles.filter(a =>
    (activeCategory === "Tất cả" || a.category === activeCategory) &&
    (a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-teal-800 text-white py-20 md:py-28">
        <div className="container-site px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Tin Tức & Y Khoa</h1>
            <p className="text-white/80 text-xl max-w-2xl mx-auto mb-8">
              Cập nhật kiến thức y học, tin tức hoạt động và các nghiên cứu mới nhất từ Viện Y Dược Học Dân Tộc.
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-white/60" />
              <Input
                placeholder="Tìm kiếm bài viết..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 text-base focus-visible:ring-white/40"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-site px-4">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap mb-10">
            {categories.map(cat => (
              <button key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-primary-600 text-white shadow-md shadow-primary-500/30"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-primary-300 hover:text-primary-700"
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Featured Article (first item) */}
          {filtered.length > 0 && (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
              className="mb-10">
              <div className={`bg-gradient-to-br ${filtered[0].imageGradient} rounded-3xl overflow-hidden shadow-xl`}>
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 h-64 md:h-auto min-h-[280px] relative opacity-80" />
                  <div className="md:w-1/2 p-10 md:p-14 text-white flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{filtered[0].category}</span>
                      {filtered[0].tag && <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">{filtered[0].tag}</span>}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold mb-4 leading-tight">{filtered[0].title}</h2>
                    <p className="text-white/80 mb-6 leading-relaxed">{filtered[0].excerpt}</p>
                    <div className="flex items-center gap-4 text-white/70 text-sm mb-8">
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {filtered[0].date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {filtered[0].readTime} đọc</span>
                    </div>
                    <Button className="bg-white text-primary-700 hover:bg-white/90 font-bold w-fit rounded-xl">
                      Đọc Bài Viết <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Article Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.slice(1).map((article, i) => (
              <motion.article key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl hover:border-primary-100 transition-all group cursor-pointer">
                <div className={`h-48 bg-gradient-to-br ${article.imageGradient} relative flex items-end p-6`}>
                  <span className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  {article.tag && (
                    <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                      {article.tag}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-stone-900 text-lg leading-tight mb-3 group-hover:text-primary-700 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-stone-400 text-xs">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {article.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {article.readTime}</span>
                    </div>
                    <span className="text-primary-600 font-semibold text-sm flex items-center gap-1">
                      Đọc <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-stone-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-xl font-semibold">Không tìm thấy bài viết phù hợp</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
