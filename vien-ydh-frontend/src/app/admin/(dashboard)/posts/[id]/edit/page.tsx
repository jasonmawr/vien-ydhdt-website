"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, Upload, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { getPostById, updatePost, getCategories, uploadFile, CategoryDTO, AttachmentDTO } from "@/services/api";
import { getAuthToken } from "@/services/auth";
import { toast } from "sonner";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category_id: "",
    excerpt: "",
    content: "",
    thumbnail: "",
    status: "published",
    meta_title: "",
    meta_description: "",
    keywords: "",
    is_featured: false,
    published_at: "",
  });

  const [attachments, setAttachments] = useState<AttachmentDTO[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchPost();
  }, [resolvedParams.id]);

  const fetchCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats || []);
    } catch {
      toast.error("Không thể tải danh mục");
    }
  };

  const fetchPost = async () => {
    try {
      const post = await getPostById(Number(resolvedParams.id));
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        category_id: post.category_id ? post.category_id.toString() : "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        thumbnail: post.thumbnail || "",
        status: post.status || "published",
        meta_title: post.meta_title || "",
        meta_description: post.meta_description || "",
        keywords: post.keywords || "",
        is_featured: !!post.is_featured,
        published_at: post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : "",
      });
      if (post.attachments) {
        setAttachments(post.attachments);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không tìm thấy bài viết.");
      router.push("/admin/posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleEditorChange = (html: string) => {
    setFormData(prev => ({ ...prev, content: html }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Chưa đăng nhập");

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedData = await uploadFile(file, token);
        
        setAttachments(prev => [...prev, {
          file_name: uploadedData.filename,
          file_url: uploadedData.url,
          file_type: uploadedData.mimetype,
          file_size: uploadedData.size
        }]);
      }
      toast.success("Tải lên tệp đính kèm thành công");
    } catch (error) {
      toast.error("Lỗi tải lên tệp");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!formData.title || !formData.content) {
      toast.error("Vui lòng nhập đầy đủ Tiêu đề và Nội dung bài viết.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Chưa đăng nhập");
      
      const payload = { 
        ...formData, 
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        status,
        attachments
      };
      
      await updatePost(Number(resolvedParams.id), payload, token);
      toast.success(status === 'published' ? "Đã xuất bản bài viết thành công!" : "Đã lưu bản nháp thành công!");
      router.push("/admin/posts");
    } catch (error) {
      console.error(error);
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 max-w-6xl mx-auto">
        <div className="text-center py-20 text-stone-500">Đang tải bài viết...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="h-10 w-10 p-0 rounded-full">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-stone-800">Chỉnh sửa bài viết</h2>
            <p className="text-stone-500 text-sm">Cập nhật nội dung bài viết #{resolvedParams.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-2"
          >
            <Save size={16} /> Lưu nháp
          </Button>
          <Button 
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting || isUploading}
            className="bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2"
          >
            <Send size={16} /> Xuất bản
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

          <div className="bg-stone-50 p-5 rounded-xl border border-stone-200">
            <h3 className="font-semibold text-stone-800 mb-4 border-b border-stone-200 pb-2">Tài liệu đính kèm</h3>
            <div className="space-y-4">
              <div>
                <input 
                  type="file" 
                  id="file-upload" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <label 
                  htmlFor="file-upload" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 rounded-md shadow-sm text-sm font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  <Upload size={16} />
                  {isUploading ? "Đang tải lên..." : "Tải lên tệp đính kèm"}
                </label>
              </div>

              {attachments.length > 0 && (
                <ul className="space-y-2">
                  {attachments.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-md">
                      <div className="flex items-center gap-3 truncate">
                        <Paperclip size={16} className="text-stone-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-stone-700 truncate">
                          <a href={file.file_url} target="_blank" rel="noreferrer" className="hover:underline">{file.file_name}</a>
                        </span>
                        <span className="text-xs text-stone-400">({Math.round((file.file_size || 0) / 1024)} KB)</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeAttachment(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-stone-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
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

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Ảnh bìa (Thumbnail URL)</label>
                <Input 
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  placeholder="https://..." 
                  className="text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Lên lịch xuất bản</label>
                <Input 
                  type="datetime-local"
                  name="published_at"
                  value={formData.published_at}
                  onChange={handleChange}
                  className="text-sm bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="is_featured" 
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-stone-300 rounded"
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-stone-700">
                  Ghim làm tin nổi bật
                </label>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 p-5 rounded-xl border border-stone-200">
            <h3 className="font-semibold text-stone-800 mb-4 border-b border-stone-200 pb-2">Tối ưu SEO</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Meta Title</label>
                <Input 
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  placeholder="Tiêu đề SEO..." 
                  className="text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Meta Description</label>
                <textarea 
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  placeholder="Mô tả SEO..."
                  className="w-full rounded-md border border-stone-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Keywords</label>
                <Input 
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  placeholder="y học cổ truyền, châm cứu..." 
                  className="text-sm bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
