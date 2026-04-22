"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPosts, deletePost, getCategories, type PostDTO } from "@/services/api";

const FALLBACK_CATEGORIES = [
  "Y học cổ truyền",
  "Hoạt động Viện",
  "Sức khỏe & Dinh dưỡng",
  "Nghiên cứu khoa học",
  "Hướng dẫn bệnh nhân",
];

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  const fetchCategories = async () => {
    try {
      const cats = await getCategories();
      if (cats.length > 0) setCategories(cats);
    } catch {
      // Dùng fallback
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // admin=true để lấy cả draft lẫn published
      const response = await getPosts(undefined, undefined, 100, 0, true);
      setPosts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (post: PostDTO) => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}"?\n\nHành động này không thể hoàn tác.`);
    if (!confirmed) return;

    try {
      await deletePost(post.id);
      // Xóa khỏi danh sách ngay lập tức không cần reload
      setPosts(prev => prev.filter(p => p.id !== post.id));
    } catch (error) {
      console.error(error);
      alert("Đã có lỗi xảy ra khi xóa bài viết.");
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "Tất cả" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

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

      <div className="flex gap-4 mb-6">
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
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-stone-600">
          <thead className="bg-stone-50 text-stone-900 font-semibold border-y border-stone-200">
            <tr>
              <th className="px-4 py-3">Tiêu đề bài viết</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Ngày đăng</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-10">Đang tải dữ liệu...</td>
              </tr>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map(post => (
                <tr key={post.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                  <td className="px-4 py-4 font-medium text-stone-900 max-w-xs truncate">{post.title}</td>
                  <td className="px-4 py-4">
                    <span className="bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md text-xs font-medium">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-4 py-4">{new Date(post.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {post.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/tin-tuc`} target="_blank" title="Xem trên web">
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
                        className="h-8 w-8 p-0 text-stone-500 hover:text-red-600"
                        onClick={() => handleDelete(post)}
                        title="Xóa bài viết"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-stone-500">Không tìm thấy bài viết nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
