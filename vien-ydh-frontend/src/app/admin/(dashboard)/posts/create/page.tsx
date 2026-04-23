"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { createPost, getCategories } from "@/services/api";
import { getAuthToken } from "@/services/auth";

const FALLBACK_CATEGORIES = [
  "Y học cổ truyền",
  "Hoạt động Viện",
  "Sức khỏe & Dinh dưỡng",
  "Nghiên cứu khoa học",
  "Hướng dẫn bệnh nhân",
];

export default function CreatePostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Y học cổ truyền",
    excerpt: "",
    content: "<p>Bắt đầu viết nội dung bài báo tại đây...</p>",
    thumbnail: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const cats = await getCategories();
      if (cats.length > 0) setCategories(cats);
    } catch {
      // Dùng fallback
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from title
      if (name === "title" && !prev.slug) {
        newData.slug = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      }
      return newData;
    });
  };

  const handleEditorChange = (html: string) => {
    setFormData(prev => ({ ...prev, content: html }));
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!formData.title || !formData.content) {
      alert("Vui lòng nhập đầy đủ Tiêu đề và Nội dung bài viết.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Chưa đăng nhập");
      await createPost({ ...formData, status }, token);
      alert(status === 'published' ? "Đã xuất bản bài viết thành công!" : "Đã lưu bản nháp thành công!");
      router.push("/admin/posts");
    } catch (error) {
      console.error(error);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-full">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-stone-800">Soạn bài viết mới</h2>
            <p className="text-stone-500 text-sm">Tạo tin tức, thông báo hoặc bài viết y khoa</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save size={16} /> Lưu nháp
          </Button>
          <Button 
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting}
            className="bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2"
          >
            <Send size={16} /> Xuất bản ngay
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Tiêu đề bài viết <span className="text-red-500">*</span></label>
            <Input 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề hấp dẫn..." 
              className="text-lg font-medium h-12 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Nội dung chi tiết <span className="text-red-500">*</span></label>
            <RichTextEditor content={formData.content} onChange={handleEditorChange} />
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-6">
          <div className="bg-stone-50 p-5 rounded-xl border border-stone-200">
            <h3 className="font-semibold text-stone-800 mb-4 border-b border-stone-200 pb-2">Thiết lập chung</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Đường dẫn (Slug)</label>
                <Input 
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="duong-dan-bai-viet" 
                  className="text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Danh mục</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-stone-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Mô tả ngắn (Excerpt)</label>
                <textarea 
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Tóm tắt nội dung để hiển thị trên trang chủ..."
                  className="w-full rounded-md border border-stone-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
