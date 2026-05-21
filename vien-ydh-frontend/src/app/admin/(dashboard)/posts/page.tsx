"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, Star, Paperclip, CheckSquare, Square, Clock, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPosts, deletePost, bulkActionPosts, getCategories, duplicatePost, type PostDTO, type CategoryDTO } from "@/services/api";
import { getAuthToken } from "@/services/auth";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  published: { label: "Xuất bản", className: "bg-green-100 text-green-700" },
  draft: { label: "Nháp", className: "bg-yellow-100 text-yellow-700" },
  scheduled: { label: "Đã lên lịch", className: "bg-blue-100 text-blue-700" },
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState<'publish' | 'unpublish' | 'delete' | ''>('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats || []);
    } catch {
      toast.error("Không thể tải danh mục");
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await getPosts(undefined, undefined, PAGE_SIZE, (currentPage - 1) * PAGE_SIZE, true);
      setPosts(response.data);
      setTotalPosts(response.pagination?.total || 0);
    } catch {
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (post: PostDTO) => {
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Chưa đăng nhập");
      const result = await duplicatePost(post.id, token);
      toast.success(`Đã nhân bản "${post.title}" → Nháp`);
      fetchPosts();
    } catch {
      toast.error("Lỗi nhân bản bài viết");
    }
  };

  const handleDelete = async (post: PostDTO) => {
    if (!confirm(`Xóa bài viết "${post.title}"? Hành động này không thể hoàn tác.`)) return;
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Chưa đăng nhập");
      await deletePost(post.id, token);
      toast.success("Đã xóa bài viết!");
      fetchPosts();
    } catch {
      toast.error("Có lỗi xảy ra khi xóa bài viết.");
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPosts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPosts.map(p => p.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) {
      toast.error("Chọn hành động và ít nhất 1 bài viết");
      return;
    }
    if (bulkAction === 'delete' && !confirm(`Xóa ${selectedIds.size} bài viết đã chọn? Không thể hoàn tác.`)) return;

    setIsBulkLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Chưa đăng nhập");
      await bulkActionPosts(bulkAction, Array.from(selectedIds), token);
      const actionLabels = { publish: 'xuất bản', unpublish: 'hủy xuất bản', delete: 'xóa' };
      toast.success(`Đã ${actionLabels[bulkAction]} ${selectedIds.size} bài viết!`);
      setSelectedIds(new Set());
      setBulkAction('');
      fetchPosts();
    } catch {
      toast.error("Lỗi thực hiện hành động");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "Tất cả" || p.category_slug_name === categoryFilter;
    return matchSearch && matchCategory;
  });

  const allSelected = filteredPosts.length > 0 && selectedIds.size === filteredPosts.length;
  const someSelected = selectedIds.size > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-800">Quản lý bài viết</h2>
          <p className="text-stone-500 text-sm">Thêm mới, chỉnh sửa và quản lý tin tức hiển thị trên web.</p>
        </div>
        <Link href="/admin/posts/create">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 flex items-center gap-2">
            <Plus size={18} /> Soạn bài mới
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
          <Input
            placeholder="Tìm kiếm tiêu đề bài viết..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-lg bg-stone-50 border-stone-200"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-lg bg-stone-50 border border-stone-200 px-3 text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="Tất cả">Tất cả danh mục</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Bulk actions bar */}
      {someSelected && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-primary-50 border border-primary-200 rounded-xl">
          <span className="text-sm font-semibold text-primary-700">Đã chọn {selectedIds.size} bài viết</span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value as typeof bulkAction)}
            className="h-8 rounded-md border border-primary-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">-- Hành động --</option>
            <option value="publish">Xuất bản tất cả</option>
            <option value="unpublish">Chuyển về nháp</option>
            <option value="delete">Xóa tất cả</option>
          </select>
          <Button
            size="sm"
            onClick={handleBulkAction}
            disabled={!bulkAction || isBulkLoading}
            className="h-8 bg-primary-600 hover:bg-primary-700 text-white"
          >
            {isBulkLoading ? "Đang xử lý..." : "Thực hiện"}
          </Button>
          <button onClick={() => setSelectedIds(new Set())} className="text-stone-400 hover:text-stone-600 text-sm ml-auto">
            Bỏ chọn
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-stone-600">
          <thead className="bg-stone-50 text-stone-900 font-semibold border-y border-stone-200">
            <tr>
              <th className="px-3 py-3 w-10">
                <button onClick={toggleSelectAll} className="text-stone-400 hover:text-primary-600" aria-label="Chọn tất cả">
                  {allSelected ? <CheckSquare size={16} className="text-primary-600" /> : <Square size={16} />}
                </button>
              </th>
              <th className="px-4 py-3">Tiêu đề bài viết</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3 text-center">Đính kèm</th>
              <th className="px-4 py-3 text-center">Nổi bật</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-right">Ngày</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-10">Đang tải dữ liệu...</td>
              </tr>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map(post => {
                const statusInfo = STATUS_LABELS[post.status] || { label: post.status, className: "bg-stone-100 text-stone-600" };
                return (
                  <tr key={post.id} className={`border-b border-stone-100 hover:bg-stone-50/50 ${selectedIds.has(post.id) ? 'bg-primary-50/30' : ''}`}>
                    <td className="px-3 py-4">
                      <button onClick={() => toggleSelect(post.id)} className="text-stone-400 hover:text-primary-600" aria-label="Chọn bài viết">
                        {selectedIds.has(post.id)
                          ? <CheckSquare size={16} className="text-primary-600" />
                          : <Square size={16} />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-4 font-medium text-stone-900 max-w-xs" title={post.title}>
                      <p className="truncate">{post.title}</p>
                      {post.scheduled_at && (
                        <p className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> {new Date(post.scheduled_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md text-xs font-medium">
                        {post.category_name || "Chưa phân loại"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {(post.attachments?.length || 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-stone-500" title={`${post.attachments?.length} tệp`}>
                          <Paperclip size={14} /> {post.attachments?.length}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {post.is_featured ? <Star size={16} className="text-yellow-500 fill-yellow-500 mx-auto" /> : "-"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-xs text-stone-500">
                      {new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/tin-tuc/${post.slug}`} target="_blank" title="Xem trên web">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-stone-500 hover:text-primary-600">
                            <Eye size={16} />
                          </Button>
                        </Link>
                        <Link href={`/admin/posts/${post.id}/edit`} title="Chỉnh sửa">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-stone-500 hover:text-blue-600">
                            <Edit size={16} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-stone-500 hover:text-amber-600"
                          onClick={() => handleDuplicate(post)}
                          title="Nhân bản bài viết"
                        >
                          <Copy size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-stone-500 hover:text-red-600"
                          onClick={() => handleDelete(post)}
                          title="Xóa bài viết"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-10 text-stone-500">Không tìm thấy bài viết nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-stone-400">
            Trang {currentPage} / {Math.max(1, Math.ceil(totalPosts / PAGE_SIZE))} — {totalPosts} bài viết
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); setSelectedIds(new Set()); }}
              disabled={currentPage === 1 || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft size={14} />
            </Button>
            {Array.from({ length: Math.min(5, Math.ceil(totalPosts / PAGE_SIZE)) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setCurrentPage(page); setSelectedIds(new Set()); }}
                  className={`h-8 w-8 p-0 text-xs ${currentPage === page ? "bg-primary-600 text-white" : ""}`}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setCurrentPage(p => Math.min(Math.ceil(totalPosts / PAGE_SIZE), p + 1)); setSelectedIds(new Set()); }}
              disabled={currentPage >= Math.ceil(totalPosts / PAGE_SIZE) || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
