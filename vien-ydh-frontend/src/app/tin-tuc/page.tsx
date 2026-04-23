"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getPosts, type PostDTO } from "@/services/api";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

const categories = ["Tất cả", "Y học cổ truyền", "Sức khỏe & Dinh dưỡng", "Hoạt động Viện", "Nghiên cứu khoa học", "Hướng dẫn bệnh nhân"];

const defaultGradients = [
  "from-primary-400 to-teal-500",
  "from-blue-400 to-primary-500",
  "from-amber-400 to-orange-500",
  "from-purple-400 to-pink-500",
  "from-teal-400 to-cyan-500",
  "from-green-400 to-teal-500"
];

export default function TinTucPage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, [activeCategory, search]);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const res = await getPosts(activeCategory, search, 20, 0);
      setPosts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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

          {isLoading ? (
            <div className="text-center py-20 text-stone-500">Đang tải bài viết...</div>
          ) : (
            <>
              {/* Featured Article (first item) */}
              {posts.length > 0 && (
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
                  className="mb-10">
                  <div className={`bg-gradient-to-br ${defaultGradients[0]} rounded-3xl overflow-hidden shadow-xl`}>
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/2 h-64 md:h-auto min-h-[280px] relative opacity-80" />
                      <div className="md:w-1/2 p-10 md:p-14 text-white flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{posts[0].category}</span>
                          {posts[0].tags && <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">{posts[0].tags}</span>}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold mb-4 leading-tight">{posts[0].title}</h2>
                        <p className="text-white/80 mb-6 leading-relaxed line-clamp-3">{posts[0].excerpt}</p>
                        <div className="flex items-center gap-4 text-white/70 text-sm mb-8">
                          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(posts[0].created_at).toLocaleDateString('vi-VN')}</span>
                          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {posts[0].view_count} lượt xem</span>
                        </div>
                        <Link href={`/tin-tuc/${posts[0].slug}`}>
                          <Button className="bg-white text-primary-700 hover:bg-white/90 font-bold w-fit rounded-xl">
                            Đọc Bài Viết <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Article Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.slice(1).map((article, i) => (
                  <motion.article key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl hover:border-primary-100 transition-all group cursor-pointer">
                    <Link href={`/tin-tuc/${article.slug}`} className="block h-full">
                    <div className={`h-48 bg-gradient-to-br ${defaultGradients[(i + 1) % defaultGradients.length]} relative flex items-end p-6`}>
                      <span className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                      {article.tags && (
                        <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                          {article.tags}
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
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(article.created_at).toLocaleDateString('vi-VN')}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {article.view_count}</span>
                        </div>
                        <span className="text-primary-600 font-semibold text-sm flex items-center gap-1">
                          Đọc <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                    </Link>
                  </motion.article>
                ))}
              </div>

              {posts.length === 0 && (
                <div className="text-center py-20 text-stone-400">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="text-xl font-semibold">Không tìm thấy bài viết phù hợp</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
