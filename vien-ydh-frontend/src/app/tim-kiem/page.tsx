"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, FileText, Users, Stethoscope, ArrowRight, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPosts, getAllDoctors, getDoctorImageUrl, type PostDTO, type DoctorDTO } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [doctors, setDoctors] = useState<DoctorDTO[]>([]);
  const [allDoctors, setAllDoctors] = useState<DoctorDTO[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "posts" | "doctors">("all");

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setPosts([]);
      setDoctors([]);
      setTotalPosts(0);
      return;
    }
    setIsLoading(true);
    try {
      const [postResult, allDocs] = await Promise.all([
        getPosts(undefined, q, 20, 0),
        allDoctors.length ? Promise.resolve(allDoctors) : getAllDoctors(),
      ]);
      setPosts(postResult.data);
      setTotalPosts(postResult.pagination.total);
      if (!allDoctors.length) setAllDoctors(allDocs);
      const filtered = (allDoctors.length ? allDoctors : allDocs).filter((d) =>
        d.fullName.toLowerCase().includes(q.toLowerCase()) ||
        (d.departmentName || "").toLowerCase().includes(q.toLowerCase())
      );
      setDoctors(filtered);
    } catch {
      setPosts([]);
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  }, [allDoctors]);

  useEffect(() => {
    setQuery(initialQuery);
    setInputValue(initialQuery);
    doSearch(initialQuery);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  const totalResults = posts.length + doctors.length;
  const hasResults = totalResults > 0;

  const filteredPosts = activeTab === "doctors" ? [] : posts;
  const filteredDoctors = activeTab === "posts" ? [] : doctors;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero search bar */}
      <section className="bg-gradient-to-br from-primary-900 to-teal-800 text-white py-16">
        <div className="container-site px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6 border border-white/20">
              <Search className="h-4 w-4 text-teal-300" />
              Tìm kiếm
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-6">
              {query ? (
                <>Kết quả cho "<span className="text-teal-300">{query}</span>"</>
              ) : (
                "Tìm kiếm thông tin"
              )}
            </h1>
            <form onSubmit={handleSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 pointer-events-none" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tìm bác sĩ, tin tức, dịch vụ..."
                className="pl-12 pr-24 h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 text-base focus-visible:ring-white/40"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => setInputValue("")}
                  className="absolute right-24 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold"
              >
                Tìm
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <div className="container-site px-4 py-10 max-w-5xl">
        {!query ? (
          <div className="text-center py-20 text-stone-400">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">Nhập từ khóa để bắt đầu tìm kiếm</p>
            <p className="text-sm mt-2">Tìm kiếm bác sĩ, chuyên khoa, tin tức sức khỏe...</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : !hasResults ? (
          <div className="text-center py-20 text-stone-400">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold text-stone-600">Không tìm thấy kết quả</p>
            <p className="text-sm mt-2">Thử tìm với từ khóa khác hoặc kiểm tra chính tả</p>
            <div className="mt-8 flex gap-3 justify-center flex-wrap">
              <Link href="/tin-tuc"><Button variant="outline" className="rounded-xl">Xem tin tức</Button></Link>
              <Link href="/bac-si"><Button variant="outline" className="rounded-xl">Xem bác sĩ</Button></Link>
              <Link href="/dat-lich"><Button className="rounded-xl bg-primary-600 text-white hover:bg-primary-700">Đặt lịch khám</Button></Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats + tabs */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <p className="text-stone-600 text-sm">
                Tìm thấy <span className="font-bold text-primary-700">{totalResults}</span> kết quả
                {totalPosts > posts.length && (
                  <span className="text-stone-400 ml-1">(hiển thị {posts.length} bài viết đầu)</span>
                )}
              </p>
              <div className="flex gap-2">
                {[
                  { key: "all", label: `Tất cả (${totalResults})` },
                  posts.length > 0 && { key: "posts", label: `Bài viết (${posts.length})` },
                  doctors.length > 0 && { key: "doctors", label: `Bác sĩ (${doctors.length})` },
                ].filter(Boolean).map((tab) => {
                  const t = tab as { key: string; label: string };
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key as "all" | "posts" | "doctors")}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                        activeTab === t.key
                          ? "bg-primary-600 text-white shadow"
                          : "bg-white border border-stone-200 text-stone-600 hover:border-primary-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-8">
              {/* Doctors section */}
              {filteredDoctors.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary-500" />
                    Bác sĩ / Chuyên gia
                  </h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredDoctors.map((doc) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-lg hover:border-primary-100 transition-all group"
                      >
                        <Link href={`/bac-si/${doc.id}`} className="block">
                          <div className="relative h-40 bg-gradient-to-br from-primary-50 to-teal-50">
                            <Image
                              src={getDoctorImageUrl(doc.id)}
                              alt={doc.fullName}
                              fill
                              sizes="25vw"
                              className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => { (e.target as HTMLImageElement).src = "/images/doctor-placeholder.png"; }}
                            />
                          </div>
                          <div className="p-4">
                            {doc.degree && (
                              <span className="text-xs font-bold text-primary-600">{doc.degree} </span>
                            )}
                            <p className="font-bold text-stone-800 text-sm line-clamp-1 group-hover:text-primary-700 transition-colors">{doc.fullName}</p>
                            <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1 truncate">
                              <Stethoscope className="h-3 w-3 shrink-0" />
                              {doc.departmentName || "Y học cổ truyền"}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Posts section */}
              {filteredPosts.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary-500" />
                    Bài viết & Tin tức
                  </h2>
                  <div className="space-y-4">
                    {filteredPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-lg hover:border-primary-100 transition-all group flex"
                      >
                        <Link href={`/tin-tuc/${post.slug}`} className="flex w-full">
                          {post.thumbnail && (
                            <div className="relative w-32 sm:w-48 shrink-0">
                              <Image
                                src={post.thumbnail}
                                alt={post.title}
                                fill
                                sizes="192px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-5 flex-1 min-w-0">
                            {post.category_name && (
                              <span className="text-xs font-bold text-primary-600 uppercase tracking-wide">
                                {post.category_name}
                              </span>
                            )}
                            <h3 className="font-bold text-stone-900 mt-1 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
                              {post.title}
                            </h3>
                            {post.excerpt && (
                              <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed">{post.excerpt}</p>
                            )}
                            <p className="text-xs text-stone-400 mt-3 flex items-center gap-1.5">
                              <span>{post.author}</span>
                              <span>·</span>
                              <span>{new Date(post.published_at || post.created_at).toLocaleDateString("vi-VN")}</span>
                            </p>
                          </div>
                          <div className="flex items-center pr-5 shrink-0">
                            <ArrowRight className="h-4 w-4 text-stone-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  {totalPosts > posts.length && (
                    <div className="text-center mt-6">
                      <Link href={`/tin-tuc?search=${encodeURIComponent(query)}`}>
                        <Button variant="outline" className="rounded-xl border-primary-200 text-primary-700 hover:bg-primary-50">
                          Xem thêm {totalPosts - posts.length} bài viết <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TimKiemPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
