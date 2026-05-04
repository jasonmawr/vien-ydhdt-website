"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getCategories, createCategory, updateCategory, deleteCategory, CategoryDTO } from "@/services/api";
import { getAuthToken } from "@/services/auth";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent_id: "",
    description: "",
    display_order: "0",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: CategoryDTO) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id?.toString() || "",
      description: category.description || "",
      display_order: category.display_order.toString(),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      parent_id: "",
      description: "",
      display_order: "0",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "name" && !prev.slug && !editingId) {
        newData.slug = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Vui lòng nhập tên và slug");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Chưa đăng nhập");

      const payload = {
        name: formData.name,
        slug: formData.slug,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        description: formData.description,
        display_order: parseInt(formData.display_order) || 0,
      };

      if (editingId) {
        await updateCategory(editingId, payload, token);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await createCategory(payload, token);
        toast.success("Tạo danh mục mới thành công");
      }

      handleCancelEdit();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này? Bài viết thuộc danh mục này sẽ bị mất danh mục.")) return;
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Chưa đăng nhập");
      await deleteCategory(id, token);
      toast.success("Đã xóa danh mục");
      fetchCategories();
    } catch (error) {
      toast.error("Lỗi xóa danh mục");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Quản lý Danh mục (Taxonomy)</h1>
          <p className="text-stone-500">Quản lý cây danh mục đa cấp cho Hệ thống bài viết</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 md:col-span-1 h-fit">
          <h2 className="text-lg font-semibold mb-4">{editingId ? "Sửa danh mục" : "Thêm danh mục mới"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên danh mục <span className="text-red-500">*</span></label>
              <Input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Đường dẫn (Slug) <span className="text-red-500">*</span></label>
              <Input name="slug" value={formData.slug} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Danh mục cha</label>
              <select 
                name="parent_id" 
                value={formData.parent_id} 
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-stone-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- Không có (Danh mục gốc) --</option>
                {categories.filter(c => c.id !== editingId).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <Input name="description" value={formData.description} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thứ tự hiển thị</label>
              <Input type="number" name="display_order" value={formData.display_order} onChange={handleChange} />
            </div>
            
            <div className="pt-2 flex gap-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white">
                {isSubmitting ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Thêm mới"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Hủy
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 md:col-span-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-stone-500">Chưa có danh mục nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-sm text-stone-500">
                    <th className="pb-3 font-medium">Tên danh mục</th>
                    <th className="pb-3 font-medium">Đường dẫn</th>
                    <th className="pb-3 font-medium">Danh mục cha</th>
                    <th className="pb-3 font-medium text-center">Thứ tự</th>
                    <th className="pb-3 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="py-3 font-medium text-stone-800">{cat.name}</td>
                      <td className="py-3 text-stone-500">{cat.slug}</td>
                      <td className="py-3 text-stone-500">
                        {cat.parent_id ? categories.find(c => c.id === cat.parent_id)?.name : "-"}
                      </td>
                      <td className="py-3 text-center">{cat.display_order}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)} className="h-8 w-8 text-blue-600">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="h-8 w-8 text-red-600 hover:text-red-700">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
