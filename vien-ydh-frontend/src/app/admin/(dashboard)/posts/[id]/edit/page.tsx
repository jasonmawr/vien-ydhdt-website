"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, Upload, Paperclip, X, Clock, Eye, History, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { getPostById, updatePost, getCategories, uploadFile, getPostVersions, CategoryDTO, AttachmentDTO } from "@/services/api";
import { getAuthToken } from "@/services/auth";
import { toast } from "sonner";

const META_DESC_MAX = 160;

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
    scheduled_at: "",
  });

  const [attachments, setAttachments] = useState<AttachmentDTO[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchPost();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        scheduled_at: post.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : "",
      });
      if (post.attachments) {
        setAttachments(post.attachments);
      }
      // Load version history
      try {
        const token = await getAuthToken();
        if (token) {
          const v = await getPostVersions(Number(resolvedParams.id), token);
          setVersions(v || []);
        }
      } catch {}
    } catch {
      toast.error("Không tìm thấy bài viết.");
      router.push("/admin/posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreVersion = (version: any) => {
    if (!confirm(`Khôi phục phiên bản lúc ${new Date(version.changed_at).toLocaleString('vi-VN')}? Nội dung hiện tại sẽ bị thay thế.`)) return;
    setFormData(prev => ({
      ...prev,
      title: version.title || prev.title,
      content: version.content || prev.content,
      excerpt: version.excerpt || prev.excerpt,
    }));
    setShowVersions(false);
    toast.success("Đã khôi phục phiên bản cũ. Nhớ lưu lại!");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        const uploadedData = await uploadFile(files[i], token);
        setAttachments(prev => [...prev, {
          file_name: uploadedData.filename,
          file_url: uploadedData.url,
          file_type: uploadedData.mimetype,
          file_size: uploadedData.size
        }]);
      }
      toast.success("Tải lên tệp đính kèm thành công");
    } catch {
      toast.error("Lỗi tải lên tệp");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (submitStatus: 'draft' | 'published') => {
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
        status: submitStatus,
        attachments
      };

      await updatePost(Number(resolvedParams.id), payload, token);
      if (formData.scheduled_at) {
        toast.success("Đã cập nhật lịch đăng bài thành công!");
      } else {
        toast.success(submitStatus === 'published' ? "Đã xuất bản bài viết thành công!" : "Đã lưu bản nháp thành công!");
      }
      router.push("/admin/posts");
    } catch {
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const metaDescLen = formData.meta_description.length;
  const isScheduled = !!formData.scheduled_at;

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
          {versions.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowVersions(v => !v)}
              className="flex items-center gap-2 text-stone-600"
              title={`${versions.length} phiên bản trước`}
            >
              <History size={16} /> {versions.length}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-2"
          >
            <Save size={16} /> Lưu nháp
          </Button>
          {isScheduled ? (
            <Button
              onClick={() => handleSubmit('published')}
              disabled={isSubmitting || isUploading}
              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
            >
              <Clock size={16} /> Cập nhật lịch đăng
            </Button>
          ) : (
            <Button
              onClick={() => handleSubmit('published')}
              disabled={isSubmitting || isUploading}
              className="bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2"
            >
              <Send size={16} /> Xuất bản
            </Button>
          )}
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
                        <a href={file.file_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-stone-700 truncate hover:underline">
                          {file.file_name}
                        </a>
                        <span className="text-xs text-stone-400">({Math.round((file.file_size || 0) / 1024)} KB)</span>
                      </div>
                      <button type="button" onClick={() => removeAttachment(idx)} className="text-red-500 hover:text-red-700">
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
                  placeholder="Tóm tắt nội dung..."
                  className="w-full rounded-md border border-stone-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-20 resize-none"
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
                {formData.thumbnail && (
                  <div className="mt-2 relative h-24 rounded-lg overflow-hidden border border-stone-200">
                    <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-100/50">
                      <Eye size={16} className="text-stone-400" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-stone-600 mb-1">
                  <Clock size={14} /> Lên lịch xuất bản
                </label>
                <Input
                  type="datetime-local"
                  name="scheduled_at"
                  value={formData.scheduled_at}
                  onChange={handleChange}
                  className="text-sm bg-white"
                />
                {isScheduled ? (
                  <p className="text-xs text-amber-600 mt-1 font-medium">Bài viết sẽ tự động đăng vào thời điểm trên</p>
                ) : (
                  <p className="text-xs text-stone-400 mt-1">Để trống nếu muốn đăng/cập nhật ngay</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured as boolean}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-stone-600">Meta Description</label>
                  <span className={`text-xs font-mono ${metaDescLen > META_DESC_MAX ? 'text-red-600 font-bold' : metaDescLen > 130 ? 'text-amber-600' : 'text-stone-400'}`}>
                    {metaDescLen}/{META_DESC_MAX}
                  </span>
                </div>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  placeholder="Mô tả SEO (tối đa 160 ký tự)..."
                  className={`w-full rounded-md border bg-white p-3 text-sm focus:outline-none focus:ring-2 min-h-20 resize-none ${metaDescLen > META_DESC_MAX ? 'border-red-300 focus:ring-red-400' : 'border-stone-200 focus:ring-primary-500'}`}
                />
                {metaDescLen > META_DESC_MAX && (
                  <p className="text-xs text-red-600 mt-1">Vượt quá {metaDescLen - META_DESC_MAX} ký tự</p>
                )}
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

      {/* Version History Sidebar */}
      {showVersions && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-stone-200 z-50 flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
            <h3 className="font-bold text-stone-800 flex items-center gap-2">
              <History size={16} /> Lịch sử phiên bản ({versions.length})
            </h3>
            <button onClick={() => setShowVersions(false)} className="text-stone-400 hover:text-stone-600">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {versions.map(v => (
              <div key={v.id} className="border border-stone-200 rounded-xl p-3 hover:border-primary-300 hover:bg-primary-50/30 transition-colors">
                <p className="text-xs font-semibold text-stone-700 mb-1 truncate">{v.title || "—"}</p>
                <p className="text-xs text-stone-500 mb-2">{new Date(v.changed_at).toLocaleString('vi-VN')}</p>
                {v.change_summary && (
                  <p className="text-xs text-stone-400 mb-2">{v.change_summary}</p>
                )}
                <button
                  onClick={() => handleRestoreVersion(v)}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  <RotateCcw size={11} /> Khôi phục phiên bản này
                </button>
              </div>
            ))}
            {versions.length === 0 && (
              <p className="text-stone-400 text-sm text-center py-8">Chưa có phiên bản nào</p>
            )}
          </div>
          <div className="px-5 py-3 border-t border-stone-100">
            <p className="text-xs text-stone-400">Phiên bản được lưu tự động mỗi khi bạn cập nhật bài viết</p>
          </div>
        </div>
      )}
    </div>
  );
}
