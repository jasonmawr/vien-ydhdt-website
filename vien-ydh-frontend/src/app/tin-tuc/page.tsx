"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Search, ChevronRight, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getPosts, getCategories, type PostDTO, type CategoryDTO } from "@/services/api";
import { useTranslations } from "next-intl";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

const defaultGradients = [
  "from-primary-400 to-teal-500",
  "from-blue-400 to-primary-500",
  "from-amber-400 to-orange-500",
  "from-purple-400 to-pink-500",
  "from-teal-400 to-cyan-500",
  "from-green-400 to-teal-500"
];

export default function TinTucPage() {
  const t = useTranslations('news');
  const [activeCategorySlug, setActiveCategorySlug] = useState('all');
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchNews();
  }, [activeCategorySlug, search]);

  const fetchCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const categorySlugParam = activeCategorySlug === 'all' ? undefined : activeCategorySlug;
      const res = await getPosts(categorySlugParam, search, 20, 0);
      setPosts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tìm bài viết featured, nếu không có thì lấy bài đầu tiên
  const featuredPost = posts.find(p => p.is_featured) || posts[0];
  // Các bài viết còn lại (loại trừ bài featuredPost)
  const gridPosts = featuredPost ? posts.filter(p => p.id !== featuredPost.id) : [];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-teal-800 text-white py-20 md:py-28">
        <div className="container-site px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t('title')}</h1>
            <p className="text-white/80 text-xl max-w-2xl mx-auto mb-8">
              {t('subtitle')}
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-white/60" />
              <Input
                placeholder={t('searchPlaceholder')}
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
            <button
              onClick={() => setActiveCategorySlug('all')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategorySlug === 'all'
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/30"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-primary-300 hover:text-primary-700"
              }`}>
              {t('categories.all')}
            </button>
            {categories.map((cat) => (
              <button key={cat.id}
                onClick={() => setActiveCategorySlug(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategorySlug === cat.slug
                    ? "bg-primary-600 text-white shadow-md shadow-primary-500/30"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-primary-300 hover:text-primary-700"
                }`}>
                {cat.name}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-stone-500">{t('loading')}</div>
          ) : (
            <>
              {/* Featured Article */}
              {featuredPost && (
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
                  className="mb-10">
                  <div className={`bg-gradient-to-br ${defaultGradients[0]} rounded-3xl overflow-hidden shadow-xl`}>
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/2 h-64 md:h-auto min-h-[280px] relative opacity-80" />
                      <div className="md:w-1/2 p-10 md:p-14 text-white flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{featuredPost.category_name || "Chưa phân loại"}</span>
                          {featuredPost.is_featured && (
                            <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                              <Star className="h-3 w-3 fill-yellow-900" /> Nổi bật
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold mb-4 leading-tight">{featuredPost.title}</h2>
                        <p className="text-white/80 mb-6 leading-relaxed line-clamp-3">{featuredPost.excerpt}</p>
                        <div className="flex items-center gap-4 text-white/70 text-sm mb-8">
                          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(featuredPost.published_at || featuredPost.created_at).toLocaleDateString('vi-VN')}</span>
                          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {featuredPost.view_count} {t('views', { count: featuredPost.view_count })}</span>
                        </div>
                        <Link href={`/tin-tuc/${featuredPost.slug}`}>
                          <Button className="bg-white text-primary-700 hover:bg-white/90 font-bold w-fit rounded-xl">
                            {t('readMore')} <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Article Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridPosts.map((article, i) => (
                  <motion.article key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl hover:border-primary-100 transition-all group cursor-pointer">
                    <Link href={`/tin-tuc/${article.slug}`} className="block h-full">
                    <div className={`h-48 bg-gradient-to-br ${defaultGradients[(i + 1) % defaultGradients.length]} relative flex items-end p-6`}>
                      <span className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {article.category_name || "Chưa phân loại"}
                      </span>
                      {article.is_featured && (
                        <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                          Nổi bật
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
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(article.published_at || article.created_at).toLocaleDateString('vi-VN')}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {article.view_count}</span>
                        </div>
                        <span className="text-primary-600 font-semibold text-sm flex items-center gap-1">
                          {t('read')} <ChevronRight className="h-4 w-4" />
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
                  <p className="text-xl font-semibold">{t('noResults')}</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
